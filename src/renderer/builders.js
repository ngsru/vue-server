var utils = require('./../utils.js');
var asset = require('./asset.js');
var common = require('./common.js');
var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/;
var isNumber = /^-?\d+/;

var builders = {
    build: function (vm, callback) {
        if (!vm.$el) {
            vm.__states.$logger.error('No $el in ViewModel', common.onLogMessage(vm));
            return;
        }

        vm.__states.isBeingReseted = false;

        process.nextTick(function () {
            // Case when VM rebuilding starts
            // This option is activated to stop building detached VMs
            if (vm.__states.isBeingReseted) {
                return;
            }

            vm.__states.componentsNames = Object.keys(
                builders.getAsset(vm, 'components')
            );

            builders.buildElements(vm, vm.$el.inner);

            if (vm.__states.children.length) {
                vm.$on('_vueServer.childVmReady', function () {
                    if (!vm.__states.children) {
                        vm.__states.$logger.error(
                            'Something went wrong while building children VMs. Please report the error.'
                        );
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
        });
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
                    if (element.dirs.component) {
                        return;
                    }

                    var tag = element.name.toLowerCase();
                    if (commonTagRE.test(tag)) {
                        return;
                    }

                    var name;
                    var cameledName;
                    var upperCameledName;
                    var compNames = vm.__states.componentsNames;
                    if (compNames.indexOf(element.name) !== -1) {
                        name = element.name;
                    } else {
                        cameledName = common.dashToCamelCase(element.name);
                        if (compNames.indexOf(cameledName) !== -1) {
                            name = cameledName;
                        } else {
                            upperCameledName = common.dashToUpperCamelCase(element.name);
                            if (compNames.indexOf(upperCameledName) !== -1) {
                                name = upperCameledName;
                            }
                        }
                    }

                    if (name) {
                        element.dirs.component = {
                            value: name,
                            options: {}
                        };
                    }
                })();

                // Statement <component is="{{name}}"></component>
                (function () {
                    var value = common.getAttributeExpression(vm, element, 'is', true);
                    if (value) {
                        element.dirs.component = {
                            value: value,
                            options: {}
                        };
                    }
                })();

                // v-for
                if (element.dirs.for) {
                    repeatElements = builders.buildForElements(vm, elements, element) || [];

                    // Insert resulting elements into "pseudo DOM"
                    Array.prototype.splice.apply(
                        elements,
                        [i + 1, element.dirs.for.renderedCount || 0].concat(repeatElements)
                    );

                    element.hidden = true;
                    element.dirs.for.renderedCount = repeatElements.length;

                    builders.buildElements(vm, elements, i + 1);
                    break;
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
                        element.hidden = true;
                        continue;
                    } else {
                        element.hidden = false;
                    }
                }

                // partial
                if (element.name === 'partial') {
                    builders.getPartial({
                        vm: vm,
                        element: element,
                        partialName: common.getAttribute(vm, element, 'name', true),
                        onDoesExist: function (partial) {
                            element.inner = partial();
                        },
                        onDoesNotExist: function () {
                            element.inner = [];
                        }
                    });
                }

                // v-repeat
                if (element.dirs.repeat) {
                    // Can't remove the repeat directive like with v-for
                    // because it will cause re-rendering v-repeat instances as simple components
                    if (!element.dirs.repeat.isCompiled) {
                        repeatElements = builders.buildRepeatElements(vm, elements, element) || [];

                        // Insert resulting elements into "pseudo DOM"
                        Array.prototype.splice.apply(
                            elements,
                            [i + 1, element.dirs.repeat.renderedCount || 0].concat(repeatElements)
                        );

                        element.hidden = true;
                        element.dirs.repeat.renderedCount = repeatElements.length;

                        builders.buildElements(vm, elements, i + 1);
                        break;
                    }

                // v-component
                } else if (element.dirs.component) {
                    // Rebuilding the component
                    // reverting to original
                    if (element.original) {
                        element.builded = {
                            inner: element.inner
                        };
                        utils.extend(element, element.original);
                        element.original = undefined;
                    }

                    if (element.inner.length) {
                        element._innerContent = element.inner;
                        element.inner = [];
                    }

                    if (element._innerContent) {
                        builders.buildElements(vm, element._innerContent);
                    }

                    builders.buildComponent(vm, element);
                }
            }

            if (element.inner && !(element._isKeyElement)) {
                builders.buildElements(vm, element.inner);
            }
        }
    },

    getPartial: function (meta) {
        var vm = meta.vm;
        var element = meta.element;
        var partialName = common.getValue(vm, meta.partialName);
        var partialAssests = builders.getAsset(vm, 'partials');
        var partial = partialAssests[partialName];
        var logMsg;

        if (partial) {
            // Compiling partial template
            if (typeof partial !== 'function') {
                partial = partialAssests[partialName] = asset.compileTemplate(
                    vm.__states.$logger,
                    partial,
                    'Partial "' + partialName + '"'
                );
            }

            if (element._prevPartialName !== partialName) {
                meta.onDoesExist(partial);
            }
            element._prevPartialName = partialName;
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
        var type = typeof value;

        if (!value) {
            return value;
        } else if (!Array.isArray(value)) {
            array = [];

            // If its an Object for iteration
            if (type === 'object') {

                for (var prop in value) {
                    array.push({
                        $key: prop,
                        $value: value[prop]
                    });
                }
            }

            value = array;
        }

        try {
            value = common.applyFilters(vm, dir.filters, value);
        } catch (e) {
            vm.__states.$logger.warn(e, common.onLogMessage(vm));
        }

        return value;
    },

    getForData: function (vm, dir) {
        var value = common.getValue(vm, dir.get);
        var array;
        var type = typeof value;

        if (!value) {
            return value;
        } else if (
            (type === 'number' || type === 'string') &&
            isNumber.test(value)
        ) {
            array = [];
            for (var i = 0; i < value; i++) {
                array.push(i);
            }
            value = array;
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

            var repeatElement;
            var repeatDataItem;

            // Walk through directive data
            for (var i = 0; i < repeatData.length; i++) {
                repeatDataItem = builders.getRepeatItemData(repeatData[i], i, element.dirs.repeat);

                // Creating "pseudo DOM" element clone
                repeatElement = cloneElement();
                repeatElement.dirs.repeat.isCompiled = true;
                if (repeatElement.dirs.if) {
                    repeatElement.dirs.if = undefined;
                }

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
        var componentName = common.execute(vm, element.dirs.component.value);
        var component = builders.getAsset(vm, 'components')[componentName];

        // If component exists
        if (component) {
            options = utils.extend({
                element: element,
                repeatData: null,
                withData: null,
                withReplaceData: null,
                isComponent: true,
                componentName: componentName
            }, options);

            options.childIndex = vm.__states.children.length;
            vm.__states.children.push(null);

            var componentComposed = builders.getComponent(vm, component, componentName);

            // Async component
            if (!componentComposed) {
                component(
                    function (data) {
                        options.component = builders.getComponent(vm, data, componentName);
                        builders.buildComponentContent(vm, element, options);
                    },
                    function (error) {
                        builders.logComponentResolveError(vm, element, componentName, error);
                    }
                );
            } else {
                options.component = componentComposed;
                builders.buildComponentContent(vm, element, options);
            }

        // If component does not exists
        } else {
            element.inner = [];
            element.dirs.component.status = 'unresolved';
            builders.logComponentResolveError(vm, element, componentName);
        }

    },

    getComponent: function (vm, component, componentName) {
        var composed;
        if (typeof component === 'function') {
            if (component.__isCtor) {
                return component;
            } else {
                return false;
            }
        } else {
            composed = asset.composeComponent(
                vm.__states.$logger, component, vm.$root.__states.mixin
            );
            builders.getAsset(vm, 'components')[componentName] = composed;
            return composed;
        }
    },

    buildComponentContent: function (vm, element, options, componentName) {
        // "wait-for" directive option (component waits for event before it shows)
        if (element.attribs['wait-for']) {
            options.waitFor = element.attribs['wait-for'];
            element.attribs['wait-for'] = undefined;
        }

        if (element.attribs.is) {
            element.attribs.is = undefined;
        }

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

    // NEW
    // Building v-for items
    buildForElements: function (vm, elements, element) {
        var repeatData = builders.getForData(vm, element.dirs.for.value);

        // If repeat data is exists
        if (repeatData) {
            var repeatElements = [];
            var cloneElement = element.clone;

            var repeatElement;
            var repeatElementWrapper;
            var repeatDataItem;

            // Walk through direcitve data
            utils.every(repeatData, function (item, index, key) {
                repeatDataItem = builders.getForItemData(item, index, element.dirs.for, key);

                // Creating "pseudo DOM" element clone
                repeatElement = cloneElement();
                repeatElement.dirs.for = undefined;

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
            });

            return repeatElements;
        }

        return false;
    },

    getRepeatItemData: function (data, index, directive) {
        var item;
        var repeatDataItem = {};

        if (data === undefined || data === null) {
            return data;
        }

        // When data is Object
        if (data.$value) {
            item = data.$value;

        // When data is Array
        } else {
            item = data;
        }

        // Case with a namespace
        // Eg. v-repeat="item: data"
        if (directive.value.arg) {
            repeatDataItem[directive.value.arg] = item;

        // Without a namespace
        } else {
            // Data is an Object
            if (typeof item === 'object' && !Array.isArray(item)) {
                repeatDataItem = item;

            // Data is not an Object
            } else {
                repeatDataItem.$value = item;
            }
        }

        if (data.$key) {
            repeatDataItem.$key = data.$key;
        }

        repeatDataItem.$index = index;

        return repeatDataItem;
    },

    getForItemData: function (data, index, directive, key) {
        var forDataItem = {};
        var hasKey = (key !== undefined);

        if (data === undefined || data === null) {
            return data;
        }

        forDataItem[directive.value.arg] = data;

        if (hasKey) {
            forDataItem.$key = index;
        }

        forDataItem.$index = index;

        // Explict key/index prop name definition
        // Eg. v-for="(index, value) in array"
        if (directive.value.index) {
            forDataItem[directive.value.index] = hasKey ? key : index;
        }

        return forDataItem;
    },

    getAsset: function (vm, asset) {
        if (vm.__states.notPublic) {
            return this.getAsset(vm.$parent, asset);
        }
        return vm.$options[asset];
    }

};

module.exports = builders;
