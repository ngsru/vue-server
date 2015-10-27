var common = require('./common.js');
var builders = require('./builders.js');
var utils = require('../utils.js');
var events = require('./events.js');

var util = require('util');

var systemProps = {
    logName: true,
    styles: true,
    nestingPath: true,
    isServer: true
};


var scope = {
    // Инициализация VM-ов для компонентов и repeat-item-ов
    initViewModel: function(contexts) {
        var options = {};
        var data = {};
        var rawVm = {};

        if (contexts.isComponent) {
            if (!contexts.parent) {
                var kkk = common.composeComponent(contexts.component);
                options = kkk.options;
                rawVm = kkk.rawVm;
            } else {
                options = contexts.component.options;
                rawVm = contexts.component.rawVm;
            }

        // Наследуем данные в контексты элементов v-repeat
        } else if (contexts.isRepeat) {
            for (var key in contexts.parent) {
                if (scope.isSystemProp(key) || data[key]) {
                    continue;
                }
                data[key] = contexts.parent[key];
            }
        }

        // Наследуем данные от родителя
        if (contexts.parent && options.inherit) {
            for (var key in contexts.parent) {
                if (scope.isSystemProp(key) || data[key] || contexts.parent.$options.methods[key]) {
                    continue;
                }
                data[key] = contexts.parent[key];
            }
        }

        // "Инициализируем" контекст
        var vm = common.extend(rawVm, data);

        if (contexts.isRepeat) {
            vm._isRepeat = true;
        }

        if (contexts.isComponent) {
            vm._isComponent = true;
        }

        options.filters = common.extend({}, contexts.filters, options.filters);
        options.partials = common.extend({}, contexts.partials, options.partials);
        options.components = common.extend({}, contexts.components, options.components);


        vm.$logger = this.$logger;

        vm.$ = {};
        vm.$$ = {};
        vm.$el = contexts.element;
        vm.$options = options;
        vm.$data = data;
        vm.$parent = contexts.parent;
        vm.$root = contexts.parent ? contexts.parent.$root : vm;

        // events bookkeeping
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm.$children = null;
        vm.$childrenReady = 0;
        vm._isCompiled = false;
        vm._isReady = false;
        vm.isServer = true;

        scope.initVmSystemMethods(vm);

        // Инициализация ТОЛЬКО для компонентов
        if (vm._isComponent) {
            var tpl = scope.initTemplate(vm);

            if (vm.$parent) {
                scope.setKeyElementInner(vm, tpl);
            // Если нет родителя, то это рутовый компонент и создадим для него специальный элемент-контейнер
            } else {
                if (!tpl) {
                    this.$logger.error('There is no $root template. Can\'t start rendering');
                }
                vm.$el = {
                    type: 'document',
                    inner: tpl || []
                };
            }


            // Прокидываем методы компонента в VM
            common.extend(vm, vm.$options.methods);

            scope.setSystemEventListeners(vm);
        }

        scope.markKeyElement(vm);

        // Инициализируем личные данные компонента (data)
        common.extend(vm, scope.initData(vm));

        // Подтягиваем данные по props
        scope.pullPropsData(vm);

        if (contexts.repeatData) {
            common.extend(vm, contexts.repeatData);
        }


        // миксины серверного Created
        if (vm.$options.mixins) {
            for (var i = 0; i < vm.$options.mixins.length; i++) {
                if (vm.$options.mixins[i].createdBe) {
                    vm.$options.mixins[i].createdBe.call(vm);
                }
            }
        }

        // серверный Created
        if (vm.$options.createdBe) {
            vm.$options.createdBe.call(vm);
        }


        scope.buildWithedData(vm, contexts);
        scope.buildComputedProps(vm);

        process.nextTick(function() {
            var isCompiledBePresent = false;
            if (vm.styles) {
                vm.$root.$emit('_vueServer.populateStyles', vm.styles);
            }

            builders.build(vm, function() {
                vm._isCompiled = true;

                if (contexts.waitFor) {
                    vm.$on(contexts.waitFor, function() {
                        scope.buildWithedData(vm, contexts);
                        scope.pullPropsData(vm, true);
                        scope.resetVmInstance(vm);
                    });
                }


                // миксины серверного Compiled
                if (vm.$options.mixins) {
                    for (var i = 0; i < vm.$options.mixins.length; i++) {
                        if (vm.$options.mixins[i].compiledBe) {
                            isCompiledBePresent = true;
                            vm.$options.mixins[i].compiledBe.call(vm);
                        }
                 
                    }
                }

                // серверный Compiled
                if (vm.$options.compiledBe) {
                    isCompiledBePresent = true;
                    vm.$options.compiledBe.call(vm);
                }


                if (!contexts.waitFor) {
                    // Страшная опция.
                    if (isCompiledBePresent && vm !== vm.$root) {
                        scope.resetVmInstance(vm);
                    } else {
                        vm._isReady = true;
                    }
                }
            });
        });


        return vm;
    },



    initVmSystemMethods: function(vm) {
        // Прокидываем методы контроля событий
        common.extend(vm, events);

        vm.$set = function(keypath, value) {
            utils.set(this, keypath, value);
            return this;
        };

        vm.$get = function(keypath, mode) {
            var result = utils.get(this, keypath);
            return result;
        };

        vm.$addChild = function(options) {
            var newVm;
            var presentVm;

            if (this.$el._componentsDetached && options.component) {
                presentVm = this.$el._componentsDetached[options.element.id + options.component.name];
                this.$el._componentsDetached[options.element.id + options.component.name] = undefined;
            }

            if ( !presentVm ) {
                newVm = scope.initViewModel(
                    common.extend({
                        parent: this,
                        filters: this.$options.filters,
                        partials: this.$options.partials,
                        components: this.$options.components
                    }, options)
                );
            } else {
                options.element._components = presentVm.$el._components;
                presentVm.$el = options.element;
                scope.buildWithedData(presentVm, options);
                scope.pullPropsData(presentVm, true);
                scope.resetVmInstance(presentVm);
                newVm = presentVm;
            }


            if (options.childIndex !== undefined) {
                this.$children[options.childIndex] = newVm;
            } else {
                this.$children = this.$children || [];
                this.$children.push(newVm);
            }
            

            if (options.ref) {
                this.$[options.ref] = newVm;
            }

            if (options.component && !options.repeatData) {
                this.$el._components = this.$el._components || {};
                this.$el._components[options.element.id + options.component.name] = newVm;
            }
        };

        vm.$nextTick = function(cb) {
            var self = this;
            process.nextTick(function() {
                cb.call(self)
            });
        };
    },



    resetVmInstance: function(vm) {
        // Передаём команду остановить сборку неактуальных дочерних VM-ов
        vm.$broadcast('_vueServer.stopBuilding');
        vm.$ = {};
        vm.$$ = {};
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm.$children = null;
        vm.$childrenReady = 0;
        vm._isReady = false;
        vm.$el._componentsDetached = vm.$el._components;
        vm.$el._components = {};
        var tpl = scope.initTemplate(vm);
        scope.setKeyElementInner(vm, tpl);

        scope.buildComputedProps(vm);
        scope.markKeyElement(vm);
        scope.setSystemEventListeners(vm);
        process.nextTick(function() {
            builders.build(vm, function() {
                vm._isReady = true;
                vm.$root.$emit('_vueServer.tryBeginCompile');
            });
        })
    },


    setKeyElementInner: function(vm, tpl) {
        if (tpl) {
            // Хитрый режим сочленения элементов
            if (this.config.replace || vm.$options.replace) {

                // Если элемент верхнего уровня - единственный
                if (!tpl[1]) {
                    vm.$el.name = '$merge'
                    vm.$el.inner = tpl;
                    
                // Если элементов верхнего уровня домуя
                } else {
                    vm.$el.name = 'partial';
                    vm.$el.attribs = {};
                    vm.$el.dirs = {};
                    vm.$el.inner = tpl;
                }

            } else {
                vm.$el.inner = tpl;
            }
        }
    },


    setSystemEventListeners: function(vm) {
        vm.$on('vueServer:action.rebuildComputed', function () {
            scope.buildComputedProps(vm);
        });

        vm.$on('vueServer:action.rebuildVm', function () {
            scope.resetVmInstance(vm);
        });

        vm.$on('_vueServer.stopBuilding', function () {
            vm.$el.__buildingInterrupted = true;
        });

        vm.$on('_vueServer.readyToCompile', function () {
            // серверный Created
            if (vm.$options.readyBe) { 
                vm.$options.readyBe.call(vm);
            }
        });
    },


    buildWithedData: function(vm, contexts) {
        var withReplaceData;
        var name;
        var value;
        // Заменяем полностью контекст данных через "плоское" наследование v-with
        if (contexts.withReplaceData) {
            for (var key in vm) {
                if (scope.isSystemProp(key) || vm.$options.methods[key]) {
                    continue;
                }

                delete vm[key];
            }
            withReplaceData = common.getValue(vm.$parent, contexts.withReplaceData);
            common.extend(vm, withReplaceData);
        }

        if (contexts.withData) {
            for (var i = 0, l = contexts.withData.length; i < l; i++) {
                item = contexts.withData[i];
                vm[item.arg] = common.getValue(vm.$parent, item.get);
            }
        }
    },



    isSystemProp: function(name) {
        if (systemProps[name]) {
            return true;
        }

        var char = name.charAt(0);
        if (char === '$' || char === '_') {
            return true;
        }

        return false;
    },




    markKeyElement: function(vm) {
        // Помечаем, что элемент является ключевым для какого-то vm-а
        vm.$el._isKeyElement = true;
        vm.$el._isReadyToBuild = false;
        if (vm._isComponent && !vm._isRepeat) {
            vm.$el._compileSelfInParentVm = true;
        } 
    },


    // Выставляем контекст данных с проверкой на валидность этих данных
    initData: function(vm) {
        var ownData = scope.initDataUnit(vm, vm.$options.data);
        var mixinResults;
        var result

        if (vm.$options.mixins) {
            mixinResults = [];
            for (var i = vm.$options.mixins.length - 1; i >= 0; i--) {
                if (vm.$options.mixins[i].data) {
                    mixinResults.push( scope.initDataUnit(vm, vm.$options.mixins[i].data) );
                }
            };

            mixinResults = mixinResults.reverse();
            mixinResults.push(ownData);
            result = common.extend.apply(common, mixinResults);
        } else {
            result = ownData;
        }

        return result;
    },


    initDataUnit: function(vm, data) {
        var result = {};
        if (data) {
            var dataType = typeof data;
            if (
                dataType === 'object' &&
                !vm.$parent &&
                data instanceof Array !== true
            ) {
                return data;
            }

            if (dataType === 'function') {
                result = data.call(vm) || {};
            } else {
                vm.$logger.warn( 'The "data" option type is not valid', common.onLogMessage(vm) );
            }
        }
        return result;
    },


    initTemplate: function(vm) {
        var template = null,
            templateFn = vm.$options.template;

        if (!templateFn) {
            this.$logger.debug( 'No "template" option provided', common.onLogMessage(vm) );
            return template;
        }

        if (typeof templateFn !== 'function') {
            this.$logger.warn( '"template" option type is not valid (' + typeof templateFn + ')', common.onLogMessage(vm) );
            return template;
        }

        template = templateFn();

        return template;
    },



    // Подсчитываем computed
    buildComputedProps: function(vm) {
        if (vm.$options.computed) {
            var item;
            for (var name in vm.$options.computed) {
                item = vm.$options.computed[name];

                if (typeof item === 'function') {
                    try {
                        vm[name] = item.call(vm);
                    } catch (e) {}
                } else {
                    try {
                        vm[name] = item.get.call(vm);
                    } catch (e) {}
                }
            }
        }

        return this;
    },


    eventDispatch: function(vm, params) {
        if (vm.$parent) {
            if (vm.$parent._isComponent) {
                vm.$parent.$emit.apply(vm.$parent, params);
            }
            this.eventDispatch(vm.$parent, params);
        }
    },


    eventBroadcast: function(vm, params) {
        if (vm.$children) {
            for (var item in vm.$children) {
                if (vm.$children[item]._isComponent) {
                    vm.$children[item].$emit.apply(vm.$children[item], params);
                }
                this.eventBroadcast(vm.$children[item], params);
            }
        }
    },


    pullPropsData: function(vm, excludeOwnDataProps) {
        var props = vm.$options.props;

        if (typeof props === 'object') {
            // Если props - массив
            if (Array.isArray(props)) {
                for (var i = 0, l = props.length; i < l; i++) {
                    this.pullPropsDataItem(vm, props[i]);
                }

            // Если сложный вид объектом
            } else {
                for (var name in props) {
                    this.pullPropsDataItem(vm, name, props[name]);
                }
            }
        }
    },


    pullPropsDataItem: function(vm, name, config) {
        var attrName = common.camelToDashCase(name);
        var propName = common.dashToCamelCase(name);
        var descriptor;

        // Небольшой костыль, чтобы с точки входа контентного компонента
        // не удалялись атрибуты, которые нужны для props, раньше времени
        vm.$el.props = vm.$el.props || {};
        if (vm.$el.attribs[attrName] !== undefined) {
            vm.$el.props[attrName] = vm.$el.attribs[attrName];
            vm.$el.attribs[attrName] = undefined;
        }

        var rawValue = vm.$el.props[attrName];

        // Сложный формат props (объектом)
        if (config !== undefined) {
            descriptor = {
                type: null,
                default: null,
                required: false,
                validator: null
            };

            if (config === null || config.constructor && config.name) {
                descriptor.type = config;
            } else {
                common.extend(descriptor, config);
            }       
        }


        var value = common.execute(vm.$parent, rawValue, {
            isEscape: false,
            isClean: false
        });


        if (descriptor) {
            if (!rawValue) {
                // Дефолтное значение
                if (descriptor.default) {
                    if (typeof descriptor.default === 'function') {
                        value = descriptor.default();
                    } else {
                        value = descriptor.default;
                    }
                }

                // Необходимое поле
                if (descriptor.required) {
                    vm.$logger.warn('Property"' + propName + '" is required');
                    return;
                }
            } else {
                // Типизация данных
                if (descriptor.type) {
                    if (!value || value.constructor != descriptor.type) {
                        var type;
                        if (value === null || value === undefined) {
                            type = value;
                        } else {
                            type = value.constructor.name;
                        }
                        vm.$logger.warn(
                            'Invalid prop: type check failed for "' + propName + '". Expected ' + descriptor.type.name + ', got ' + type,
                            common.onLogMessage(vm)
                        );
                        return;
                    }
                }

                // Валидация данных
                if (rawValue && descriptor.validator && !descriptor.validator(value)) {
                    vm.$logger.warn( 'Invalid prop: custom validator check failed for "' + propName + '"', common.onLogMessage(vm) );
                    return;
                }
            }
        }



        // Наследование колбеков от родителя
        if (typeof value === 'function') {
            vm[propName] = utils.bind(value, vm.$parent);
        } else {
            vm[propName] = value;
        }
    }
};


module.exports = scope;