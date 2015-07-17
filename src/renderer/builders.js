var _ = require('underscore');
var common = require('./common.js');

var builders = {
    build: function(vm, callback) {
        if (!vm.$el) {
            vm.$logger.error( 'No $el in ViewModel: ' + common.getVmPath(vm) );
            return;
        }

        // Кейс, когда запускается пересборка VM-ов. 
        // Через данную опцию передаётся команда остановить сборку неактуальных VM-ов
        if (vm.$el.__buildingInterrupted) {
            return;
        }

        vm.$el._isReadyToBuild = true;

        builders.buildElements(vm, vm.$el.inner);

        if (vm._children) {
            vm.$on('_vueServer.childVmReady', function() {
                if (!vm._children) {
                    vm.$logger.error( 'Something went wrong while building children VMs. Please report the error.' );
                    return;
                }
                vm._childrenReady++;

                if (vm._childrenReady === vm._children.length) {
                    if (callback) {
                        callback();
                    }

                    vm.$emit('_vueServer.vmReady');

                    if (vm.$parent) {
                        vm.$parent.$emit('_vueServer.childVmReady');
                    }

                    vm.$off('_vueServer.childVmReady');
                }
            });
        } else {
            if (callback) {
                callback();
            }

            vm.$emit('_vueServer.vmReady');

            if (vm.$parent) {
                vm.$parent.$emit('_vueServer.childVmReady');
            }
        }


    },


    buildElements: function(vm, elements, customIndex) {
        var element;
        var repeatElements;

        for (var i = customIndex || 0, l = elements.length; i < l; i++) {
            element = common.setElement(elements[i]);

            if (element.type === 'tag') {

                // trying to check for custom-tag component
                if (vm.$options.components[element.name]) {
                    element.dirs.component = {
                        value: element.name,
                        options: {}
                    };
                }

                // v-if
                if (element.dirs.if) {
                    var vIfResult = common.execute({
                        vm: vm,
                        value: element.dirs.if.value,
                        isEscape: false,
                        isClean: false
                    });

                    if (!vIfResult) {
                        elements.splice(i, 1);
                        builders.buildElements(vm, elements, i);
                        break;
                    }
                } 


                // v-partial
                if (element.dirs.partial) {
                    builders.getPartial({
                        'vm': vm,
                        'partialName': element.dirs.partial.value,
                        'onDoesExist': function(partial) {
                            element.inner = partial();
                        },
                        'onDoesNotExist': function() {
                            element.inner = [];
                        }
                    });

                    // element.dirs.partial = undefined;
                }


                // v-repeat
                if (element.dirs.repeat) {

                    if (!element.dirs.repeat.isCompiled) {
                        elements.splice(i, 1);

                        repeatElements = builders.buildRepeatElements(vm, elements, element, i);

                        if (repeatElements) {
                            // Вставляем получившиеся элементы в псведо-dom
                            Array.prototype.splice.apply(elements, [i, 0].concat(repeatElements));
                        }

                        builders.buildElements(vm, elements, i);
                        break;
                    }


                // v-component
                } else if (element.dirs.component) {
                    builders.buildComponent(vm, element);
                    // element.dirs.component = undefined;
                }

            }


            if (element.inner && !(element._isKeyElement && !element._isReadyToBuild) ) {
                builders.buildElements(vm, element.inner);
            }
        };
    },


    getPartial: function(meta) {
        var vm = meta.vm;
        var partialName = common.getValNew(vm, meta.partialName);
        var partial = vm.$options.partials[partialName];
        var logMsg;

        if (partial) {
            meta.onDoesExist(partial);
        } else {
            logMsg = 'There is no partial "' + partialName + '": ' + common.getVmPath(vm);
            if (meta.partialName) {
                vm.$logger.warn( logMsg );
            } else {
                vm.$logger.debug( logMsg );
            }
            meta.onDoesNotExist();
        }
    },


    getRepeatData: function(vm, dir) {
        var value = vm.$get(dir.expression);
        value = common.applyFilters(vm, dir.filters, value);

        return value;
    },


    // Создаём элементы по v-repeat
    buildRepeatElements: function(vm, elements, element) {
        var repeatData = builders.getRepeatData(vm, element.dirs.repeat.value);
        var repeatDataIsArray = Array.isArray(repeatData);

        // Если есть данные по директиве
        if ( !_.isEmpty(repeatData) ) {
            var repeatElements = [];
            var cloneElement = element.clone;
            var index = 0;

            var item;
            var repeatElement;
            var repeatDataItem;
            var repeatOptions;

            // Проходим циклом по данным директивы
            for (var key in repeatData) {
                item = repeatData[key];
                repeatDataItem = {};
                repeatOptions = {
                    isRepeat: true,
                    repeatIndex: index,
                    repeatValue: item
                };


                // Для специальных переменных $key, $value
                // когда repeat пробегает по объекту
                if (!repeatDataIsArray) {
                    repeatOptions.repeatKey = key;
                } 


                // Случай с созданием неймспейса для данных вложенных в v-repeat
                // например v-repeat="item:data"
                if (element.dirs.repeat.value.arg) {
                    repeatDataItem[element.dirs.repeat.value.arg] = item;
                } else {
                    repeatDataItem = item;
                }


                // Создаём клон псевдо-dom элемента
                repeatElement = cloneElement();
                repeatElement.dirs.repeat.isCompiled = true;
                repeatElements.push(repeatElement);


                // Создаём контекст данных для элемента
                if (!element.dirs.component) {
                    vm.$addChild(
                        common.extend(repeatOptions, {
                            element: repeatElement,
                            repeatData: repeatDataItem,
                        })
                    );
                } else {
                    builders.buildComponent(vm, repeatElement, 
                        common.extend(repeatOptions, {
                            repeatData: repeatDataItem,
                        })
                    );
                }

                index++;
            }

            return repeatElements;
        }

        return false;
    },


    // Обрабатываем элемент с v-component
    buildComponent: function(vm, element, options) {
        options = common.extend({
            element: element,
            repeatData: null,
            withData: null,
            withReplaceData: null,
            isComponent: true
        }, options);

        var componentName = common.getValNew(vm, element.dirs.component.value);
        var component = vm.$options.components[componentName];

        // Такой компонент есть
        if (component) {
            if (!component.__composed) {
                component.__composed = common.composeComponent(component);
            }
            
            options.component = {
                rawVm: common.extend({}, component.__composed.rawVm),
                options: component.__composed.options
            };

            // Опция директивы wait-for (компонент ждёт срабатывания события перед тем как покажется)
            if (element.dirs.component.options.waitFor) {
                options.waitFor = element.dirs.component.options.waitFor;
            }

            if (element.dirs.ref) {
                options.ref = element.dirs.ref.value;
            }

            options.component.name = componentName;

            if (element.dirs.with) {
                // Здесь интересный момент. Если значение в v-with прописано в формате одного аргумента
                // например v-with="cat", то контекст данных компонента полностью определяется данной директивой,
                // т.е. у компонента будут только данные, содержащиеся в "cat" родителя
                if (element.dirs.with.value.length === 1 && !element.dirs.with.value[0].arg ) {
                    options.withReplaceData = element.dirs.with.value[0].get;
                } else {
                    options.withData = element.dirs.with.value;
                }
            }

            vm.$addChild(options);

        // Такого компонента нет
        } else {
            var logMessage = 'Failed to resolve component: "' + componentName +'": ' + common.getVmPath(vm);
            element.inner = [];

            if (componentName) {
                vm.$logger.warn(logMessage, element);
            } else {
                vm.$logger.debug(logMessage, element);
            }
        } 
    }
}



module.exports = builders;
