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

            data = scope.initData(options);

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


        if (contexts.repeatData) {
            if (contexts.repeatIndex !== undefined) {
                rawVm.$index = contexts.repeatIndex;
            }

            if (contexts.repeatKey !== undefined) {
                rawVm.$key = contexts.repeatKey;
            }

            if (contexts.repeatValue !== undefined) {
                rawVm.$value = contexts.repeatValue;
            }

            common.extend(data, contexts.repeatData);
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


        vm.logName = options.logName;
        vm.$logger = this.$logger;

        vm.$ = {};
        vm.$$ = {};
        vm.$el = contexts.element;
        vm.$options = options;
        vm.$data = data;
        vm.$parent = contexts.parent;
        vm.$root = contexts.parent ? contexts.parent.$root : vm;
        // vm.$components = vm.components = {};
        vm.$components = {};

        // events bookkeeping
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm._children = null;
        vm._childrenReady = 0;
        vm._isCompiled = false;
        vm._isReady = false;
        vm.isServer = true;

        scope.initVmSystemMethods(vm);

        // Инициализация ТОЛЬКО для компонентов
        if (vm._isComponent) {
            // NESTING PATH
            vm.nestingPath = scope.getNestingPath(vm);

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

        vm._isCreated = true;

        scope.onParamAttributes(vm, function(props) {
            props.forEach(function (name) {
                vm[common.toCamelCase(name)] = null;
            });
        });

        // серверный Created
        if (vm.$options.createdBe) {
            vm.$options.createdBe.call(vm);
        }

        scope.buildWithedData(vm, contexts);
        scope.buildComputedProps(vm);

        process.nextTick(function() {
            if (vm.styles) {
                vm.$root.$emit('_vueServer.populateStyles', vm.styles);
            }

            builders.build(vm, function() {
                vm._isCompiled = true;

                // серверный Compiled
                if (vm.$options.compiledBe) {
                    vm.$options.compiledBe.call(vm);
                }

                if (contexts.waitFor) {
                    vm.$on(contexts.waitFor, function() {
                        // Вообще, если раскомментить эту строчку, то произойдёт чудо и данные
                        // переданные через v-with из контентного компонента к дочерним, изменённые в процессе
                        // отработки хука compiled начнут автоматически просасываться внутрь.
                        // Но мне страшно
                        scope.buildWithedData(vm, contexts);
                        scope.resetVmInstance(vm);
                    });
                } else {
                    // Её одна страшная опция. Не буду пока включать. Немного понижает производительность
                    if (vm.$options.compiledBe && vm !== vm.$root) {
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

        vm.$compiler = {
            isCleanActive: false,
            getOption: function(option, value) {
                var filter = vm.$options.filters[value];
                var replacement = function(v) {
                    return v;
                };

                if (!filter) {
                    filter = replacement;
                    vm.$logger.warn( 'Unknown filter "' + value + '":', common.getVmPath(vm) );
                }

                if (typeof filter === 'function') {
                    return filter;
                } else {
                    return filter.read || replacement;
                }

            },

            cleanValue: function(value) {
                if (this.isCleanActive) {
                    return common.cleanValue(value);    
                } else {
                    return value;
                }
                
            },

            // Brand new strip function
            // Better than any "replace" version;
            escapeHtml: function(str) {
                if (typeof str !== 'string') {
                    return this.cleanValue(str);
                }

                return this.cleanValue(
                    str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                );
            }
        };

        vm.$set = function(keypath, value) {
            utils.set(this, keypath, value);
            return this;
        };

        vm.$get = function(keypath, mode) {
            var result = utils.get(this, keypath);
            var isSelf = true;
            var value;

            if (this._isRepeat && !this._isComponent) {
                isSelf = false;
            }

            var type = typeof result;

            if (type === 'function') {
                value = utils.bind(result, isSelf ? this : this.$parent);
            } else {
                value = result;
            }

            return value;
        };

        vm.$addChild = function(options) {
            var newVm;
            var presentVm;

            if (this.$el._componentsDetached && options.component && options.component.name) {
                presentVm = this.$el._componentsDetached[options.component.name];
            }

            if ( !presentVm || presentVm === 'stack' || presentVm._isRepeat ) {
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
                scope.resetVmInstance(presentVm);
                newVm = presentVm;
            }


            this._children = this._children || [];
            this._children.push(newVm);

            if (options.ref) {
                this.$[options.ref] = newVm;
            }

            if (options.component && options.component.name) {
                this.$components[options.component.name] = newVm;

                this.$el._components = this.$el._components || {};
                if (this.$el._components[options.component.name]) {
                    this.$el._components[options.component.name] = 'stack';
                } else {
                    this.$el._components[options.component.name] = newVm;
                }
            }

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

        vm._children = null;
        vm._childrenReady = 0;
        vm._isReady = false;
        vm.$components = {};
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
            if (vm.$options.replace) {
                if (vm._isRepeat) {
                    this.$logger.warn('"replace" option can\'t be used in v-repeat-ed component', vm.nestingPath);
                    vm.$el.inner = tpl;
                } else {
                    for (var param in tpl[0]) {
                        if (param === 'dirs') {
                            for (var dir in tpl[0].dirs) {
                                tpl[0].dirs[dir].vm = vm;
                            }
                            
                            vm.$el.dirs = common.extend({}, tpl[0].dirs, vm.$el.dirs);
                            continue;
                        }

                        if (param === 'attribs') {
                            vm.$el.attribs = common.extend({}, tpl[0].attribs, vm.$el.attribs);
                            continue;
                        }

                        vm.$el[param] = tpl[0][param];
                    }
                    if (tpl[1]) {
                        this.$logger.warn('The component\'s template has more then one top level element. They won\'t be compiled properly', vm.nestingPath);
                    }
                    vm.$el.replaced = true;
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
            withReplaceData = common.getValue(vm.$parent, contexts.withReplaceData, true);
            common.extend(vm, withReplaceData);
        }

        if (contexts.withData) {
            for (var i = 0, l = contexts.withData.length; i < l; i++) {
                item = contexts.withData[i];
                vm[item.arg] = common.getValue(vm.$parent, item.key, true);
            }
        }

        scope.onParamAttributes(vm, function(props) {
            for (var i = 0, l = props.length; i < l; i++) {
                name = props[i];
                value = vm.$el.attribs[name];
                if (value) {
                    vm[common.toCamelCase(name)] = common.getValue(vm.$parent, value, true);
                    vm.$el.attribs[name] = undefined;
                }
            }
        });
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
    initData: function(options) {
        if (options.data) {
            var dataType = typeof options.data;
            if (
                !options.parent &&
                dataType === 'object' &&
                options.data instanceof Array !== true
            ) {
                return options.data;
            }

            if (dataType !== 'function') {
                this.$logger.warn( 'The "data" option type is not valid: ' + common.getVmPath(vm) );
            } else {
                return options.data() || {};
            }
        }

        return {};
    },


    initTemplate: function(vm) {
        var template = null,
            templateFn = vm.$options.template;

        if (!templateFn) {
            this.$logger.debug('No "template" option: ' + common.getVmPath(vm));
            return template;
        }

        if (typeof templateFn !== 'function') {
            this.$logger.warn('"template" option type is not valid (' + typeof templateFn + '): ' + common.getVmPath(vm));
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


    getNestingPath: function(vm) {
        var str = vm.$options.name,
            child;

        if (vm.$parent) {
            child = this.getNestingPath(vm.$parent);

            if (child) {
                str = child + '::' + str;
            }
        } else {
            str = '';
        }

        return str;
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
        if (vm._children) {
            for (var item in vm._children) {
                if (vm._children[item]._isComponent) {
                    vm._children[item].$emit.apply(vm._children[item], params);
                }
                this.eventBroadcast(vm._children[item], params);
            }
        }
    },


    onParamAttributes: function(vm, callback) {
        var props = vm.$options.paramAttributes || vm.$options.props;
        if (props && Array.isArray(props)) {
            callback(props);
        }
    }
};


module.exports = scope;