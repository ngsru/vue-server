var _ = require('underscore');
var common = require('./common.js');

var builders = {
    build: function (vm, callback) {
        if (!vm.$el) {
            vm.$logger.error('No $el in ViewModel', common.onLogMessage(vm));
            return;
        }

        // Кейс, когда запускается пересборка VM-ов.
        // Через данную опцию передаётся команда остановить сборку неактуальных VM-ов
        if (vm.$el.__buildingInterrupted) {
            return;
        }

        vm.$el._isReadyToBuild = true;

        builders.buildElements(vm, vm.$el.inner);

        if (vm.__states.children.length) {
            vm.$on('_vueServer.childVmReady', function () {
                if (!vm.__states.children) {
                    vm.$logger.error('Something went wrong while building children VMs. Please report the error.');
                    return;
                }
                vm.__states.childrenReadyCount++;

                if (vm.__states.childrenReadyCount === vm.__states.children.length) {
                    if (callback) {
                        callback();
                    }

                    vm.$emit('_vueServer.vmReady');

                    if (vm.__states.parent) {
                        vm.__states.parent.$emit('_vueServer.childVmReady');
                    }

                    vm.$off('_vueServer.childVmReady');
                }
            });
        } else {
            if (callback) {
                callback();
            }

            vm.$emit('_vueServer.vmReady');

            if (vm.__states.parent) {
                vm.__states.parent.$emit('_vueServer.childVmReady');
            }
        }

    },

    buildElements: function (vm, elements, customIndex) {
        var element;
        var repeatElements;

        for (var i = customIndex || 0, l = elements.length; i < l; i++) {
            element = common.setElement(elements[i]);

            if (element.type === 'tag') {

                // trying to check for custom-tag component
                // <comp-name></comp-name>
                (function () {
                    var name;
                    var cameledName;
                    var $components = builders.getAsset(vm, 'components');
                    if ($components[element.name]) {
                        name = element.name;
                    } else {
                        cameledName = common.dashToCamelCase(element.name);
                        if ($components[cameledName]) {
                            name = cameledName;
                        }
                    }

                    if (name) {
                        element.dirs.component = {
                            value: name,
                            options: {}
                        };
                    }
                })();

                // Конструкция <component is="{{name}}"></component>
                if (
                    element.attribs.is ||
                    (
                        element.dirs.bind &&
                        element.dirs.bind.is
                    )
                ) {
                    element.dirs.component = {
                        value: common.getAttribute(vm, element, 'is'),
                        options: {}
                    };
                }

                // v-for
                if (element.dirs.for) {

                    if (!element.dirs.for.isCompiled) {
                        elements.splice(i, 1);

                        repeatElements = builders.buildForElements(vm, elements, element);

                        if (repeatElements) {
                            // Вставляем получившиеся элементы в псведо-dom
                            Array.prototype.splice.apply(elements, [i, 0].concat(repeatElements));
                        }

                        builders.buildElements(vm, elements, i);
                        break;
                    }
                }

                // v-if
                if (element.dirs.if) {
                    var vIfResult = common.execute(vm, {
                        value: element.dirs.if.value.get,
                        filters: element.dirs.if.value.filters,
                        isEscape: false,
                        isClean: false
                    });

                    if (!vIfResult) {
                        elements.splice(i, 1);
                        builders.buildElements(vm, elements, i);
                        break;
                    }
                }

                // partial
                if (element.name === 'partial') {
                    builders.getPartial({
                        'vm': vm,
                        'partialName': common.getAttribute(vm, element, 'name'),
                        'onDoesExist': function (partial) {
                            element.inner = partial();
                        },
                        'onDoesNotExist': function () {
                            element.inner = [];
                        }
                    });
                }

                // v-repeat
                if (element.dirs.repeat) {

                    if (!element.dirs.repeat.isCompiled) {
                        elements.splice(i, 1);

                        repeatElements = builders.buildRepeatElements(vm, elements, element);

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

            if (element.inner && !(element._isKeyElement && !element._isReadyToBuild)) {
                builders.buildElements(vm, element.inner);
            }
        }
    },

    getPartial: function (meta) {
        var vm = meta.vm;
        var partialName = common.getValue(vm, meta.partialName);
        var partial = builders.getAsset(vm, 'partials')[partialName];
        var logMsg;

        if (partial) {
            meta.onDoesExist(partial);
        } else {
            logMsg = 'There is no partial "' + partialName + '"';
            if (meta.partialName) {
                vm.$logger.warn(logMsg, common.onLogMessage(vm));
            } else {
                vm.$logger.debug(logMsg, common.onLogMessage(vm));
            }
            meta.onDoesNotExist();
        }
    },

    getRepeatData: function (vm, dir) {
        var value = vm.$get(dir.expression);
        var array;

        if (!value) {
            return value;
        } else {
            if (!Array.isArray(value)) {
                array = [];

                for (var prop in value) {
                    array.push({
                        $key: prop,
                        $value: value[prop]
                    });
                }

                value = array;
            }
        }

        try {
            value = common.applyFilters(vm, dir.filters, value);
        } catch (e) {
            vm.$logger.warn(e, common.onLogMessage(vm));
        }

        return value;
    },

    // Создаём элементы по v-repeat
    buildRepeatElements: function (vm, elements, element) {
        var repeatData = builders.getRepeatData(vm, element.dirs.repeat.value);
        // var repeatDataIsArray = Array.isArray(repeatData);

        // Если есть данные по директиве
        if (repeatData && repeatData.length) {
            var repeatElements = [];
            var cloneElement = element.clone;

            var item;
            var repeatElement;
            var repeatDataItem;
            var repeatOptions;

            // Проходим циклом по данным директивы
            for (var i = 0; i < repeatData.length; i++) {
                repeatDataItem = {};

                // Когда репитим объект
                if (repeatData[i].$value) {
                    item = repeatData[i].$value;

                // Когда просто массив
                } else {
                    item = repeatData[i];
                }

                // Случай с созданием неймспейса для данных вложенных в v-repeat
                // например v-repeat="item: data"
                if (element.dirs.repeat.value.arg) {
                    repeatDataItem[element.dirs.repeat.value.arg] = item;

                // Без неймспейса
                } else {
                    // Данные - объект
                    if (typeof item === 'object' && !Array.isArray(item)) {
                        repeatDataItem = item;

                    // Данные - что-то другое
                    } else {
                        repeatDataItem.$value = item;
                    }
                }

                if (repeatData[i].$key) {
                    repeatDataItem.$key = repeatData[i].$key;
                }

                // Кастомное определения имени параметра с индексом
                // вид v-for="(index, value) in array"
                if (element.dirs.repeat.value.index) {
                    repeatDataItem[element.dirs.repeat.value.index] = i;
                } else {
                    repeatDataItem.$index = i;
                }

                // Создаём клон псевдо-dom элемента
                repeatElement = cloneElement();
                repeatElement.dirs.repeat.isCompiled = true;

                // repeatElement - репликация element, образ которого создаёт compiler
                // Если компонент вставляется через тег, то у него изначально директива v-component не прописана
                // и у реплицированного компонента её тоже не будет, поэтому - прокидываем
                repeatElement.dirs.component = element.dirs.component;
                repeatElements.push(repeatElement);

                // Создаём контекст данных для элемента
                if (!element.dirs.component) {
                    vm.$addChild({
                        isRepeat: true,
                        element: repeatElement,
                        repeatData: repeatDataItem,
                    });
                } else {
                    builders.buildComponent(vm, repeatElement, {
                        isRepeat: true,
                        repeatData: repeatDataItem,
                    });
                }
            }

            return repeatElements;
        }

        return false;
    },

    // Обрабатываем элемент с v-component
    buildComponent: function (vm, element, options) {
        var componentName = common.getValue(vm, element.dirs.component.value);
        var component = builders.getAsset(vm, 'components')[componentName];

        if (element.attribs['wait-for']) {
            element.dirs.component.options.waitFor = element.attribs['wait-for'];
        }

        element.attribs.is = undefined;
        element.attribs['wait-for'] = undefined;

        // Такой компонент есть
        if (component) {
            options = common.extend({
                element: element,
                repeatData: null,
                withData: null,
                withReplaceData: null,
                isComponent: true
            }, options);

            // Забиваем себе местечко под солнцем
            options.childIndex = vm.__states.children.length;
            vm.__states.children.push({});

            // Асинхронный компонент
            if (typeof component === 'function') {
                component(
                    function (data) {
                        builders.getAsset(vm, 'components')[componentName] = data;
                        builders.buildComponentContent(vm, element, options, data, componentName);
                    },
                    function (error) {
                        builders.logComponentResolveError(vm, element, componentName, error);
                    }
                );
            } else {
                builders.buildComponentContent(vm, element, options, component, componentName);
            }

        // Такого компонента нет
        } else {
            element.inner = [];
            builders.logComponentResolveError(vm, element, componentName);
        }

    },

    // Собственно, кишки
    buildComponentContent: function (vm, element, options, component, componentName) {
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
            options.ref = element.dirs.ref;
        }

        options.component.name = componentName;

        if (element.dirs.with) {
            // Здесь интересный момент. Если значение в v-with прописано в формате одного аргумента
            // например v-with="cat", то контекст данных компонента полностью определяется данной директивой,
            // т.е. у компонента будут только данные, содержащиеся в "cat" родителя
            if (element.dirs.with.value.length === 1 && !element.dirs.with.value[0].arg) {
                options.withReplaceData = element.dirs.with.value[0].get;
            } else {
                options.withData = element.dirs.with.value;
            }
        }

        vm.$addChild(options);
    },

    logComponentResolveError: function (vm, element, componentName, reason) {
        var logMessage = 'Failed to resolve component: "' + componentName + '"';

        if (reason) {
            logMessage += '. Reason: ' + reason;
        }

        if (componentName) {
            vm.$logger.warn(logMessage, common.onLogMessage(vm));
        } else {
            vm.$logger.debug(logMessage, common.onLogMessage(vm));
        }
    },

    mergeSlotItems: function (vm, tpl) {
        var slots = {
            unnamed: null,
            named: null
        };

        if (!tpl[0].inner) {
            return;
        }
        var elInner = vm.$el.inner;
        var tplInner = tpl[0].inner;

        for (var i = tplInner.length - 1; i >= 0; i--) {
            if (tplInner[i].name === 'slot') {
                if (tplInner[i].attribs.name) {
                    slots.named = slots.named || {};
                    slots.named[tplInner[i].attribs.name] = tplInner[i];
                } else {
                    if (!slots.unnamed) {
                        slots.unnamed = tplInner[i];
                    } else {
                        vm.$logger.warn('Duplicate unnamed <slot>', common.onLogMessage(vm));
                    }
                }
            }
        };

        if (slots.unnamed || slots.named) {
            for (var i = elInner.length - 1; i >= 0; i--) {
                if (
                    elInner[i].attribs &&
                    elInner[i].attribs.slot &&
                    slots.named &&
                    slots.named[elInner[i].attribs.slot]
                ) {
                    builders.fillSlot(
                        slots.named[elInner[i].attribs.slot],
                        elInner[i]
                    );
                } else if (slots.unnamed) {
                    builders.fillSlot(
                        slots.unnamed,
                        elInner[i]
                    );
                }
            }
        }
    },

    fillSlot: function (element, item) {
        if (!element.filled) {
            element.inner = [];
            element.filled = true;
        }

        element.inner.push(item);
    },

    // NEW
    // Building v-for items
    buildForElements: function (vm, elements, element) {
        var repeatData = builders.getRepeatData(vm, element.dirs.for.value);
        // var repeatDataIsArray = Array.isArray(repeatData);

        // Если есть данные по директиве
        if (repeatData && repeatData.length) {
            var repeatElements = [];
            var cloneElement = element.clone;

            var item;
            var repeatElement;
            var repeatElementWrapper;
            var repeatDataItem;
            var repeatOptions;

            // Проходим циклом по данным директивы
            for (var i = 0; i < repeatData.length; i++) {
                repeatDataItem = {};

                // Когда репитим объект
                if (repeatData[i].$value) {
                    item = repeatData[i].$value;

                // Когда просто массив
                } else {
                    item = repeatData[i];
                }

                // Случай с созданием неймспейса для данных вложенных в v-repeat
                // например v-repeat="item: data"
                if (element.dirs.for.value.arg) {
                    repeatDataItem[element.dirs.for.value.arg] = item;

                // Без неймспейса
                } else {
                    // Данные - объект
                    if (typeof item === 'object' && !Array.isArray(item)) {
                        repeatDataItem = item;

                    // Данные - что-то другое
                    } else {
                        repeatDataItem.$value = item;
                    }
                }

                if (repeatData[i].$key) {
                    repeatDataItem.$key = repeatData[i].$key;
                }

                // Кастомное определения имени параметра с индексом
                // вид v-for="(index, value) in array"
                if (element.dirs.for.value.index) {
                    repeatDataItem[element.dirs.for.value.index] = i;
                } else {
                    repeatDataItem.$index = i;
                }

                // Создаём клон псевдо-dom элемента
                repeatElement = cloneElement();
                repeatElement.dirs.for.isCompiled = true;

                // repeatElement - репликация element, образ которого создаёт compiler
                // Если компонент вставляется через тег, то у него изначально директива v-component не прописана
                // и у реплицированного компонента её тоже не будет, поэтому - прокидываем
                repeatElement.dirs.component = element.dirs.component;

                repeatElementWrapper = {
                    'type': 'tag',
                    'name': '$merge',
                    'attribs': {},
                    'inner': [repeatElement],
                    'dirs': {},
                    'close': true,
                    'pre': false
                };

                repeatElements.push(repeatElementWrapper);

                vm.$addLightChild({
                    isRepeat: true,
                    element: repeatElementWrapper,
                    repeatData: repeatDataItem,
                });
            }

            return repeatElements;
        }

        return false;
    },

    getAsset: function (vm, asset) {
        if (vm.__states.notPublic) {
            return this.getAsset(vm.$parent, asset);
        }
        return vm.$options[asset];
    }

};

module.exports = builders;
