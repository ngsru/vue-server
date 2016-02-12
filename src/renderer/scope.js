var common = require('./common.js');
var builders = require('./builders.js');
var utils = require('../utils.js');
var events = require('./events.js');

var util = require('util');

var scope = {
    // Init VMs for components and repeat items
    initViewModel: function (contexts) {
        var options = {};
        var data = {};

        if (contexts.isComponent) {
            common.extend(options, new contexts.component());

        // Inherit data to v-repeat items contexts
        } else if (contexts.isRepeat) {
            for (var key in contexts.parent) {
                if (scope.isSystemProp(key, contexts.parent) || data[key]) {
                    continue;
                }
                data[key] = contexts.parent[key];
            }
        }

        // Inherit parent data
        if (contexts.parent && options.inherit) {
            scope.inheritData(data, contexts.parent);
        }

        // Init context
        var vm = common.extend(data, this.globalPrototype);
        vm.__states = {};
        vm.__states.parent = contexts.parent;
        vm.__states.children = [];
        vm.__states.childrenReadyCount = 0;

        if (contexts.isRepeat) {
            vm.__states.isRepeat = true;
        }

        if (contexts.isComponent) {
            vm.__states.isComponent = true;
        }

        if (this.config.strict) {
            options.filters = common.extend({}, this.filters, options.filters);
            options.partials = common.extend({}, this.partials, options.partials);
            options.components = common.extend({}, this.components, options.components);
            // In strict mode components should be able to invoke itself
            if (contexts.componentName) {
                options.components[contexts.componentName] = contexts.components[contexts.componentName];
            }
        } else {
            options.filters = common.extend({}, this.filters, contexts.filters, options.filters);
            options.partials = common.extend({}, this.partials, contexts.partials, options.partials);
            options.components = common.extend({}, this.components, contexts.components, options.components);
        }

        vm.__states.$logger = this.$logger;

        this.setRefsAndEls(vm);
        vm.$el = contexts.element;
        vm.$options = options;
        vm.$data = data;
        vm.$parent = contexts.parentLink ? contexts.parentLink : contexts.parent;
        vm.$root = contexts.parent ? contexts.parent.$root : vm;

        // events bookkeeping
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm.$children = [];
        vm._isCompiled = false;
        vm._isReady = false;
        vm.isServer = true;

        scope.initVmSystemMethods(vm);

        // Init ONLY for components
        if (vm.__states.isComponent) {
            var tpl = scope.initTemplate(vm);

            if (vm.__states.parent) {
                scope.setKeyElementInner(vm, tpl);

            // If threre are no parent, then we have root component
            // Creating special container for root component
            } else {
                if (!tpl) {
                    vm.__states.$logger.error('There is no $root template. Can\'t start rendering');
                }
                vm.$el = {
                    type: 'document',
                    inner: tpl || []
                };
                vm.__states.mixin = this.mixin;
            }

            // Setting component method to VM
            common.extend(vm, vm.$options.methods);

            scope.setEventListeners(vm);
        }

        scope.markKeyElement(vm);

        // Init VM data from 'data' option
        scope.initData(vm);

        // Pull props data
        scope.pullPropsData(vm);

        if (contexts.repeatData) {
            common.extend(vm, contexts.repeatData);
        }

        // Events option binded event handlers
        if (vm.$options.events) {
            for (var name in vm.$options.events) {
                vm.$on(name, utils.bind(vm.$options.events[name], vm));
            }
        }

        // Server Created mixins
        if (vm.$options.mixins) {
            for (var i = 0; i < vm.$options.mixins.length; i++) {
                if (vm.$options.mixins[i].createdBe) {
                    vm.$options.mixins[i].createdBe.call(vm);
                }
            }
        }

        // Server Created hook
        if (vm.$options.createdBe) {
            vm.$options.createdBe.call(vm);
            vm.$emit('hook:createdBe');
        }

        scope.buildWithedData(vm, contexts);
        scope.buildComputedProps(vm);

        builders.build(vm, function () {
            var isCompiledBePresent = false;
            vm._isCompiled = true;

            if (!vm.$options.activateBe && contexts.waitFor) {
                vm.$on(contexts.waitFor, function () {
                    scope.buildWithedData(vm, contexts);
                    scope.pullPropsData(vm);
                    scope.resetVmInstance(vm);
                });
            }

            // Server Compiled mixins
            if (vm.$options.mixins) {
                for (var i = 0; i < vm.$options.mixins.length; i++) {
                    if (vm.$options.mixins[i].compiledBe) {
                        isCompiledBePresent = true;
                        break;
                    }
                }

                process.nextTick(function () {
                    for (var i = 0; i < vm.$options.mixins.length; i++) {
                        if (vm.$options.mixins[i].compiledBe) {
                            vm.$options.mixins[i].compiledBe.call(vm);
                        }
                    }
                });
            }

            // Server Compiled hook
            if (vm.$options.compiledBe) {
                isCompiledBePresent = true;
                process.nextTick(function () {
                    vm.$options.compiledBe.call(vm);
                    vm.$emit('hook:compiledBe');
                });
            }

            if (vm.$options.activateBe) {
                process.nextTick(function () {
                    vm.$options.activateBe.call(vm, function () {
                        scope.buildWithedData(vm, contexts);
                        scope.pullPropsData(vm);
                        scope.resetVmInstance(vm);
                    });
                    vm.$emit('hook:activateBe');
                });
            }

            if (!contexts.waitFor && !vm.$options.activateBe) {
                // Experimental option
                if (isCompiledBePresent && vm !== vm.$root) {
                    process.nextTick(function () {
                        scope.resetVmInstance(vm);
                    });
                } else {
                    vm._isReady = true;
                }
            }
        });

        return vm;
    },

    initVmSystemMethods: function (vm) {
        // Setting event control methods
        common.extend(vm, events);

        vm.$set = function (keypath, value) {
            utils.set(this, keypath, value);
            return this;
        };

        vm.$get = function (keypath, mode) {
            var result = utils.get(this, keypath);
            return result;
        };

        vm.$addChild = function (options) {
            var newVm;
            var presentVm;
            var $target = scope.getRealParent(vm);

            if (this.__states.VMsDetached && options.component && !options.repeatData) {
                presentVm = this.__states.VMsDetached[options.element.id + options.componentName];
                this.__states.VMsDetached[options.element.id + options.componentName] = undefined;
            }

            if (!presentVm) {
                newVm = scope.initViewModel(
                    common.extend({
                        parent: this,
                        parentLink: $target,
                        filters: $target.$options.filters,
                        partials: $target.$options.partials,
                        components: $target.$options.components
                    }, options)
                );
            } else {
                options.element._components = presentVm.__states.VMs;
                presentVm.$el = options.element;
                scope.buildWithedData(presentVm, options);
                scope.pullPropsData(presentVm);
                scope.resetVmInstance(presentVm);
                newVm = presentVm;
            }

            // Needed for async component support
            // Async component is not created immediately
            if (options.childIndex !== undefined) {
                this.__states.children[options.childIndex] = newVm;
            } else {
                this.__states.children.push(newVm);
            }

            // VMs from v-for no need to add in $children
            $target.$children.push(newVm);

            if (options.element.dirs.ref) {
                (function () {
                    var name = common.dashToCamelCase(options.element.dirs.ref.value);

                    if (newVm.__states.isRepeat || newVm.__states.parent.__states.notPublic) {
                        $target.$refs[name] = $target.$refs[name] || [];
                        $target.$refs[name].push(newVm);
                    } else {
                        $target.$refs[name] = newVm;
                    }

                })();
            }

            if (!this.__states.notPublic && options.component && !options.repeatData) {
                this.__states.VMs = this.__states.VMs || {};
                this.__states.VMs[options.element.id + options.componentName] = newVm;
            }
        };

        vm.$addLightChild = function (options) {
            var newVm = scope.initLightViewModel(
                common.extend({
                    parent: this,
                    filters: this.$options.filters
                }, options)
            );

            // Needed for async component support
            // Async component is not created immediately
            if (options.childIndex !== undefined) {
                this.__states.children[options.childIndex] = newVm;
            } else {
                this.__states.children.push(newVm);
            }
        };

        vm.$nextTick = function (cb) {
            var self = this;
            process.nextTick(function () {
                cb.call(self);
            });
        };

        vm.$log = function (name) {
            this.$logger.log(this[name]);
        };
    },

    resetVmInstance: function (vm) {
        // Command to stop building not relevant children VMs
        vm.$broadcast('_vueServer.stopBuilding');
        this.setRefsAndEls(vm);
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm.$children = [];
        vm.__states.children = [];
        vm.__states.childrenReadyCount = 0;
        vm._isReady = false;
        vm.__states.VMsDetached = vm.__states.VMs;
        vm.__states.VMs = {};
        var tpl = scope.initTemplate(vm);
        scope.setKeyElementInner(vm, tpl);

        scope.buildComputedProps(vm);
        scope.markKeyElement(vm);
        scope.setEventListeners(vm);
        builders.build(vm, function () {
            vm._isReady = true;
            vm.$root.$emit('_vueServer.tryBeginCompile');
        });
    },

    setKeyElementInner: function (vm, tpl) {
        var shouldReplace = this.config.replace;

        if (vm.$options.replace !== undefined) {
            shouldReplace = vm.$options.replace;
        }

        if (tpl) {
            // Element merge mode
            if (shouldReplace) {

                // If there is only one top level element
                if (!tpl[1]) {
                    // scope.saveInnerTemplate(vm, tpl);
                    vm.$el.name = '$merge';
                    vm.$el.inner = tpl;

                // If there are many top level elements
                } else {
                    vm.$el.name = 'partial';
                    vm.$el.inner = tpl;
                }

            } else {
                // scope.saveInnerTemplate(vm, tpl);
                vm.$el.inner = tpl;
            }
        } else {
            vm.$el.name = 'partial';
            // scope.saveInnerTemplate(vm);
            // vm.$el.inner = [];
        }
    },

    saveInnerTemplate: function (vm, tpl) {
        if (vm.$el.inner && vm.$el.inner.length) {
            vm.$el.innerOutside = vm.$el.inner;
        }
    },

    setEventListeners: function (vm) {
        vm.$on('vueServer:action.rebuildComputed', function () {
            scope.buildComputedProps(vm);
        });

        vm.$on('_vueServer.stopBuilding', function () {
            vm.$el.__buildingInterrupted = true;
        });

        vm.$on('_vueServer.readyToCompile', function () {
            // Server Ready mixins
            if (vm.$options.mixins) {
                for (var i = 0; i < vm.$options.mixins.length; i++) {
                    if (vm.$options.mixins[i].readyBe) {
                        vm.$options.mixins[i].readyBe.call(vm);
                    }
                }
            }

            // Server Ready hook
            if (vm.$options.readyBe) {
                vm.$options.readyBe.call(vm);
                vm.$emit('hook:readyBe');
            }
        });

        // Cross-VM events defined inside templates
        if (vm.$el.dirs && vm.$el.dirs.on) {
            if (vm.$el.dirs.on.value.hasArgs) {
                vm.$on(
                    vm.$el.dirs.on.value.event,
                    function () {
                        vm.$el.dirs.on.value.handler.call(vm.$parent, vm.$parent);
                    }
                );
            } else {
                vm.$on(
                    vm.$el.dirs.on.value.event,
                    common.getValue(vm.$parent, vm.$el.dirs.on.value.handler).bind(vm.$parent)
                );
            }
        }
    },

    buildWithedData: function (vm, contexts) {
        var withReplaceData;
        var name;
        var value;
        // Replace data context by w-with "flat" inheritance
        if (contexts.withReplaceData) {
            for (var key in vm) {
                if (scope.isSystemProp(key) || vm.$options.methods[key]) {
                    continue;
                }

                delete vm[key];
            }
            withReplaceData = common.getValue(vm.__states.parent, contexts.withReplaceData);
            common.extend(vm, withReplaceData);
        }

        if (contexts.withData) {
            for (var i = 0, l = contexts.withData.length; i < l; i++) {
                item = contexts.withData[i];
                vm[item.arg] = common.getValue(vm.__states.parent, item.get);
            }
        }
    },

    isSystemProp: function (name, $parent) {
        if ($parent && $parent.$options.methods && $parent.$options.methods[name]) {
            return false;
        }

        var char = name.charAt(0);
        if (char === '$' || char === '_') {
            return true;
        }

        return false;
    },

    markKeyElement: function (vm) {
        // Mark the key element for VM
        vm.$el._isKeyElement = true;
        vm.$el._isReadyToBuild = false;
        if (vm.__states.isComponent && !vm.__states.isRepeat) {
            vm.$el._compileSelfInParentVm = true;
        }
    },

    // Set data context and validate data
    initData: function (vm) {
        var ownData = scope.initDataUnit(vm, vm.$options.data);
        var mixinResults;
        var result;

        if (vm.$options.mixins) {
            mixinResults = [];
            for (var i = vm.$options.mixins.length - 1; i >= 0; i--) {
                if (vm.$options.mixins[i].data) {
                    mixinResults.push(scope.initDataUnit(vm, vm.$options.mixins[i].data));
                }
            }

            mixinResults = mixinResults.reverse();
            mixinResults.push(ownData);
            result = common.extend.apply(common, mixinResults);
        } else {
            result = ownData;
        }

        common.extend(vm, result);
    },

    initDataUnit: function (vm, data) {
        var result = {};
        if (data) {
            var dataType = typeof data;
            if (
                dataType === 'object' &&
                !vm.__states.parent &&
                data instanceof Array !== true
            ) {
                return data;
            }

            if (dataType === 'function') {
                result = data.call(vm) || {};
            } else {
                vm.__states.$logger.warn('The "data" option type is not valid', common.onLogMessage(vm));
            }
        }
        return result;
    },

    initTemplate: function (vm) {
        if (vm.$options.template) {
            return vm.$options.template();
        } else {
            return null;
        }
    },

    // Compute "computed" props
    buildComputedProps: function (vm) {
        if (vm.$options.computed) {
            var item;
            for (var name in vm.$options.computed) {
                item = vm.$options.computed[name];

                if (typeof item === 'function') {
                    try {
                        vm[name] = item.call(vm);
                    } catch (error) {
                        vm.__states.$logger.debug(
                            'Computed property "' + name + '" compilation error',
                            common.onLogMessage(vm), '\n',
                            error
                        );
                    }
                } else {
                    try {
                        vm[name] = item.get.call(vm);
                    } catch (error) {
                        vm.__states.$logger.debug(
                            'Computed property "' + name + '" compilation error',
                            common.onLogMessage(vm), '\n',
                            error
                        );
                    }
                }
            }
        }

        return this;
    },

    pullPropsData: function (vm) {
        var props = vm.$options.props;
        vm.__states.initialDataMirror = vm.__states.initialDataMirror || {};

        if (typeof props === 'object') {
            // If props is Array
            if (Array.isArray(props)) {
                for (var i = 0, l = props.length; i < l; i++) {
                    this.pullPropsDataItem(vm, props[i]);
                }

            // If props is Object
            } else {
                for (var name in props) {
                    this.pullPropsDataItem(vm, name, props[name]);
                }
            }
        }
    },

    pullPropsDataItem: function (vm, name, config) {
        var attrName = common.camelToDashCase(name);
        var propName = common.dashToCamelCase(name);
        var descriptor;

        // It is to point to the entrance of the component content
        // not to prematurely remove the attributes required for props
        vm.$el.props = vm.$el.props || {};
        if (vm.$el.attribs[attrName] !== undefined) {
            vm.$el.props[attrName] = vm.$el.attribs[attrName];
            vm.$el.attribs[attrName] = undefined;
        }

        // If props is Object
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

        // v-for context
        // var parentScope = vm.__states.vForScope ? vm.__states.vForScope: vm.$parent;

        var value;

        var rawValue = vm.$el.props[attrName];

        // Implementation of setting props by v-bind
        if (vm.$el.dirs.bind && vm.$el.dirs.bind[attrName]) {
            rawValue = {
                value: vm.$el.dirs.bind[attrName].value.get,
                filters: vm.$el.dirs.bind[attrName].value.filters
            };
            vm.$el.dirs.bind[attrName].isCompiled = true;
        }

        if (rawValue) {
            value = common.execute(vm.__states.parent, rawValue, {
                isEscape: false,
                isClean: false
            });
        }

        var mirroredValue = vm.__states.initialDataMirror[propName];
        if (mirroredValue !== undefined && vm.__states.initialDataMirror[propName] === value) {
            return;
        } else {
            vm.__states.initialDataMirror[propName] = value;
        }

        if (descriptor) {
            if (!rawValue) {
                // Default value
                if (typeof descriptor.default === 'function') {
                    value = descriptor.default();
                } else {
                    value = descriptor.default;
                }

                // Required field
                if (descriptor.required) {
                    vm.__states.$logger.warn('Property"' + propName + '" is required');
                    return;
                }
            } else {
                // Data types
                if (descriptor.type) {
                    var hasTypeError = false;
                    var type;

                    if (value === null || value === undefined) {
                        hasTypeError = true;
                        type = value;
                    } else if (value.constructor != descriptor.type) {
                        hasTypeError = true;
                        type = value.constructor.name;
                    }

                    if (hasTypeError) {
                        vm.__states.$logger.warn(
                            'Invalid prop: type check failed for "' + propName + '". Expected ' +
                                descriptor.type.name + ', got ' + type,
                            common.onLogMessage(vm)
                        );
                        return;
                    }
                }

                // Data validation
                if (rawValue && descriptor.validator && !descriptor.validator(value)) {
                    vm.__states.$logger.warn('Invalid prop: custom validator check failed for "' + propName +
                        '"', common.onLogMessage(vm));
                    return;
                }
            }
        }

        // Callback inheritance from parent
        if (typeof value === 'function') {
            value = utils.bind(value, vm.__states.parent);
        }

        vm[propName] = value;
    },

    inheritData: function (dataTo, dataFrom) {
        for (var key in dataFrom) {
            if (scope.isSystemProp(key) || dataTo[key] || dataFrom.$options.methods[key]) {
                continue;
            }
            dataTo[key] = dataFrom[key];
        }

        return dataTo;
    },

    // Init VMs for v-for
    initLightViewModel: function (contexts) {
        var options = {};
        var vm = common.extend({}, this.globalPrototype);

        for (var key in contexts.parent) {
            if (scope.isSystemProp(key, contexts.parent) || vm[key]) {
                continue;
            }
            vm[key] = contexts.parent[key];
        }

        vm.__states = {};
        vm.__states.parent = contexts.parent;
        vm.__states.children = [];
        vm.__states.childrenReadyCount = 0;
        vm.__states.notPublic = true;

        if (this.config.strict) {
            options.filters = common.extend({}, this.filters, options.filters);
        } else {
            options.filters = common.extend({}, this.filters, contexts.filters, options.filters);
        }

        vm.__states.$logger = this.$logger;

        this.setRefsAndEls(vm);
        vm.$el = contexts.element;
        vm.$options = options;
        vm.$parent = contexts.parentLink ? contexts.parentLink : contexts.parent;
        vm.$root = contexts.parent.$root;

        // events bookkeeping
        vm._events = {};
        vm._eventsCount = {};
        vm._eventCancelled = false;

        vm._isCompiled = false;
        vm._isReady = false;
        vm.isServer = true;

        scope.initVmSystemMethods(vm);

        scope.markKeyElement(vm);

        if (contexts.repeatData) {
            common.extend(vm, contexts.repeatData);
        }

        builders.build(vm, function () {
            vm._isReady = true;
        });

        return vm;
    },

    getRealParent: function (vm) {
        if (vm.__states.notPublic) {
            return this.getRealParent(vm.__states.parent);
        }

        return vm;
    },

    setRefsAndEls: function (vm) {
        vm.$refs = {};
        vm.$els = {};
        vm.$ = vm.$refs;
        vm.$$ = vm.$els;
    }
};

module.exports = scope;
