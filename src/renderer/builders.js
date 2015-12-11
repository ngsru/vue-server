var common = require('./common.js');

var tagsNotComponents = {
    select: true,
    input: true,
    article: true,
    main: true,
    form: true,
    label: true
};

var builders = {
    build: function (vm, callback) {
        if (!vm.$el) {
            vm.__states.$logger.error('No $el in ViewModel', common.onLogMessage(vm));
            return;
        }

        // Case when VM rebuilding starts
        // This option is passed through to stop building detached VMs
        if (vm.$el.__buildingInterrupted) {
            return;
        }

        vm.$el._isReadyToBuild = true;

        builders.buildElements(vm, vm.$el.inner);

        if (vm.__states.children.length) {
            vm.$on('_vueServer.childVmReady', function () {
                if (!vm.__states.children) {
                    vm.__states.$logger.error('Something went wrong while building children VMs. Please report the error.');
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
                    var upperCameledName;
                    var $components = builders.getAsset(vm, 'components');
                    if ($components[element.name]) {
                        name = element.name;
                    } else {
                        cameledName = common.dashToCamelCase(element.name);
                        if ($components[cameledName]) {
                            name = cameledName;
                        } else {
                            upperCameledName = common.dashToUpperCamelCase(element.name);
                            if ($components[upperCameledName]) {
                                name = upperCameledName;
                            }
                        }
                    }

                    if (name) {

                        if (tagsNotComponents[element.name]) {
                            vm.__states.$logger.debug(
                                'Native tag "' + element.name + '" matched component name "' + name + '"', common.onLogMessage(vm)
                            );
                            return;
                        }

                        element.dirs.component = {
                            value: name,
                            options: {}
                        };
                    }
                })();

                // Statement <component is="{{name}}"></component>
                if (
                    element.attribs.is ||
                    (
                        element.dirs.bind &&
                        element.dirs.bind.is
                    )
                ) {
                    element.dirs.component = {
                        value: common.getAttribute(vm, element, 'is', true),
                        options: {}
                    };
                }

                // v-for
                if (element.dirs.for) {

                    if (!element.dirs.for.isCompiled) {
                        elements.splice(i, 1);

                        repeatElements = builders.buildForElements(vm, elements, element);

                        if (repeatElements) {
                            // Insert resulting elements into "pseudo DOM"
                            Array.prototype.splice.apply(elements, [i, 0].concat(repeatElements));
                        }

                        builders.buildElements(vm, elements, i);
                        break;
                    }
                }

                // v-if
                if (element.dirs.if && !element.dirs.repeat) {
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
                        'partialName': common.getAttribute(vm, element, 'name', true),
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
                            // Insert resulting elements into "pseudo DOM"
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
                vm.__states.$logger.warn(logMsg, common.onLogMessage(vm));
            } else {
                vm.__states.$logger.debug(logMsg, common.onLogMessage(vm));
            }
            meta.onDoesNotExist();
        }
    },

    getRepeatData: function (vm, dir) {
        var value = common.getValue(vm, dir.get);
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
            vm.__states.$logger.warn(e, common.onLogMessage(vm));
        }

        return value;
    },

    // Creating elements from v-repeat
    buildRepeatElements: function (vm, elements, element) {
        var repeatData = builders.getRepeatData(vm, element.dirs.repeat.value);
        // var repeatDataIsArray = Array.isArray(repeatData);

        // If directive data exists
        if (repeatData && repeatData.length) {
            var repeatElements = [];
            var cloneElement = element.clone;

            var item;
            var repeatElement;
            var repeatDataItem;
            var repeatOptions;

            // Walk through directive data
            for (var i = 0; i < repeatData.length; i++) {
                repeatDataItem = {};

                // When object is repeated
                if (repeatData[i].$value) {
                    item = repeatData[i].$value;

                // When array is repeated
                } else {
                    item = repeatData[i];
                }

                // Case with the creation of a namespace for "v-repeat" data
                // Eg. v-repeat="item: data"
                if (element.dirs.repeat.value.arg) {
                    repeatDataItem[element.dirs.repeat.value.arg] = item;

                // Without a namespace
                } else {
                    // Data is object
                    if (typeof item === 'object' && !Array.isArray(item)) {
                        repeatDataItem = item;

                    // Data is not an object
                    } else {
                        repeatDataItem.$value = item;
                    }
                }

                if (repeatData[i].$key) {
                    repeatDataItem.$key = repeatData[i].$key;
                }

                // Explict key/index prop name definition
                // Eg. v-for="(index, value) in array"
                if (element.dirs.repeat.value.index) {
                    repeatDataItem[element.dirs.repeat.value.index] = i;
                } else {
                    repeatDataItem.$index = i;
                }

                // Creating "pseudo DOM" element clone
                repeatElement = cloneElement();
                repeatElement.dirs.repeat.isCompiled = true;

                // repeatElement - element replication created by compiler
                // If component is custom tag then it has not "v-component" directive
                // so setting it manually
                repeatElement.dirs.component = element.dirs.component;
                repeatElements.push(repeatElement);

                // Creating data context for element
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

    // Building element with "v-component" directive
    buildComponent: function (vm, element, options) {
        var componentName = common.getValue(vm, element.dirs.component.value);
        var component = builders.getAsset(vm, 'components')[componentName];

        if (element.attribs['wait-for']) {
            element.dirs.component.options.waitFor = element.attribs['wait-for'];
        }

        element.attribs.is = undefined;
        element.attribs['wait-for'] = undefined;

        // If component exists
        if (component) {
            options = common.extend({
                element: element,
                repeatData: null,
                withData: null,
                withReplaceData: null,
                isComponent: true
            }, options);

            options.childIndex = vm.__states.children.length;
            vm.__states.children.push(null);

            // Async component
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

        // If component does not exists
        } else {
            element.inner = [];
            builders.logComponentResolveError(vm, element, componentName);
        }

    },

    buildComponentContent: function (vm, element, options, component, componentName) {
        if (!component.__composed) {
            component.__composed = common.composeComponent(component, vm.$root.__states.mixin);
        }

        options.component = {
            rawVm: common.extend({}, component.__composed.rawVm),
            options: component.__composed.options
        };

        // "wait-for" directive option (component waits for event before it shows)
        if (element.dirs.component.options.waitFor) {
            options.waitFor = element.dirs.component.options.waitFor;
        }

        if (element.dirs.ref) {
            options.ref = element.dirs.ref;
        }

        options.component.name = componentName;

        if (element.dirs.with) {
            // If "v-with" directive value is single argument (Eg. v-with="cat") then data context
            // for component is completely determined by this directive
            // i.e. component will have data contained in parent's "cat"
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
            vm.__states.$logger.warn(logMessage, common.onLogMessage(vm));
        } else {
            vm.__states.$logger.debug(logMessage, common.onLogMessage(vm));
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
                        vm.__states.$logger.warn('Duplicate unnamed <slot>', common.onLogMessage(vm));
                    }
                }
            }
        }

        if (slots.unnamed || slots.named) {
            for (var j = elInner.length - 1; j >= 0; j--) {
                if (
                    elInner[j].attribs &&
                    elInner[j].attribs.slot &&
                    slots.named &&
                    slots.named[elInner[j].attribs.slot]
                ) {
                    builders.fillSlot(
                        slots.named[elInner[j].attribs.slot],
                        elInner[j]
                    );
                } else if (slots.unnamed) {
                    builders.fillSlot(
                        slots.unnamed,
                        elInner[j]
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
        var repeatData;

        if (element.dirs.for.value.static) {
            repeatData = element.dirs.for.value.static;
        } else {
            repeatData = builders.getRepeatData(vm, element.dirs.for.value);
        }

        // If repeat data is exists
        if (repeatData && repeatData.length) {
            var repeatElements = [];
            var cloneElement = element.clone;

            var item;
            var repeatElement;
            var repeatElementWrapper;
            var repeatDataItem;
            var repeatOptions;

            // Walk through direcitve data
            for (var i = 0; i < repeatData.length; i++) {
                repeatDataItem = {};

                // When data is Object
                if (repeatData[i].$value) {
                    item = repeatData[i].$value;

                // When data is Array
                } else {
                    item = repeatData[i];
                }

                // Case with the creation of a namespace for "v-repeat" data
                // Eg. v-repeat="item: data"
                if (element.dirs.for.value.arg) {
                    repeatDataItem[element.dirs.for.value.arg] = item;

                // Without namespace
                } else {
                    // Data is Object
                    if (typeof item === 'object' && !Array.isArray(item)) {
                        repeatDataItem = item;

                    // Data is not an Object
                    } else {
                        repeatDataItem.$value = item;
                    }
                }

                if (repeatData[i].$key) {
                    repeatDataItem.$key = repeatData[i].$key;
                }

                // Explict key/index prop name definition
                // Eg. v-for="(index, value) in array"
                if (element.dirs.for.value.index) {
                    repeatDataItem[element.dirs.for.value.index] = i;
                } else {
                    repeatDataItem.$index = i;
                }

                // Creating "pseudo DOM" element clone
                repeatElement = cloneElement();
                repeatElement.dirs.for.isCompiled = true;

                // repeatElement - element replication created by compiler
                // If component is custom tag then it has not "v-component" directive
                // so setting it manually
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
