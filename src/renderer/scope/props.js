var utils = require('./../../utils.js');
var common = require('./../common.js');

module.exports = {
    formatType: function (type) {
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
    },

    /**
     * Format value
     *
     * @param {*} value
     * @return {String}
     */
    formatValue: function (val) {
        return Object.prototype.toString.call(val).slice(8, -1);
    },

    /**
     * Assert the type of a value
     *
     * @param {*} value
     * @param {Function} type
     * @return {Object}
     */
    assertType: function (value, type) {
        var valid;
        var expectedType;
        if (type === String) {
            expectedType = 'string';
            valid = typeof value === expectedType;
        } else if (type === Number) {
            expectedType = 'number';
            valid = typeof value === expectedType;
        } else if (type === Boolean) {
            expectedType = 'boolean';
            valid = typeof value === expectedType;
        } else if (type === Function) {
            expectedType = 'function';
            valid = typeof value === expectedType;
        } else if (type === Object) {
            expectedType = 'object';
            valid = toString.call(value) === '[object Object]';
        } else if (type === Array) {
            expectedType = 'array';
            valid = Array.isArray(value);
        } else {
            valid = value instanceof type;
        }
        return {
            valid: valid,
            expectedType: expectedType
        };
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
        var self = this;
        var props = vm.$options.props;
        if (props) {
            vm.__states.hasProps = true;
            utils.each(props, function (item, name) {
                self.pullPropsDataItem(vm, name, item);
            });
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
                utils.extend(descriptor, config);
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
            // if (!vm.__states.indepent) {
            //     typeof
            // }
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
                    vm.__states.$logger.warn(
                        'Missing required prop: ' + propName, common.onLogMessage(vm)
                    );
                    return;
                }
            } else {
                // Data types
                if (descriptor.type) {
                    var hasTypeError = false;
                    var expectedTypes = [];

                    if (value !== null && value !== undefined) {
                        if (Array.isArray(descriptor.type)) {
                            (function () {
                                hasTypeError = true;
                                for (var i = 0; i < descriptor.type.length; i++) {
                                    var typeResult = this.assertType(value, descriptor.type[i]);
                                    expectedTypes.push(typeResult.expectedType);
                                    if (typeResult.valid) {
                                        hasTypeError = false;
                                        break;
                                    }
                                }
                            }).call(this);
                        } else {
                            var typeResult = this.assertType(value, descriptor.type);
                            if (!typeResult.valid) {
                                expectedTypes.push(typeResult.expectedType);
                                hasTypeError = true;
                            }
                        }
                    }

                    if (hasTypeError) {
                        vm.__states.$logger.warn(
                            'Invalid prop: type check failed for "' + propName + '". Expected ' +
                                expectedTypes.map(this.formatType).join(', ') + ', got ' + this.formatValue(value),
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
    }
};
