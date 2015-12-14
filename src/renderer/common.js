var Path = require('./../parsers/path');

var compiler = require('./../compiler');

var excludeInstanceOptions = {
    'data': true,
    'methods': true,
    'computed': true,
    'props': true,
    'el': true,
    'elementDirective': true,
    'parent': true,
    'template': true,
    'replace': true,
    'created': true,
    'createdBe': true,
    'beforeCompile': true,
    'compiled': true,
    'compiledBe': true,
    'activate': true,
    'activateBe': true,
    'ready': true,
    'readyBe': true,
    'attached': true,
    'detached': true,
    'beforeDestroy': true,
    'destroyed': true,
    'directives': true,
    'filters': true,
    'components': true,
    'partials': true,
    'transitions': true,
    'inherit': true,
    'events': true,
    'watch': true,
    'mixins': true,
    'name': true
};

var common = {
    getValue: function (vm, value) {
        var result;

        if (typeof value === 'function') {
            try {
                result = value.call(vm, vm);
            } catch (e) {
                vm.__states.$logger.warn('Error executing expression [begin]', common.onLogMessage(vm));
                vm.__states.$logger.warn(e.toString());
                vm.__states.$logger.warn(value.toString());
                vm.__states.$logger.warn('Error executing expression [end]');
            }
        } else {
            result = value;
        }

        return result;
    },

    execute: function (vm, value, options) {
        var result = '';

        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    result += this.executeSingle(vm, value[i], options);
                }
                return result;
            } else {
                return this.executeSingle(vm, value, options);
            }
        } else {
            return this.getValue(vm, value);
        }
    },

    executeSingle: function (vm, config, options) {
        var value = this.getValue(vm, config.value);

        try {
            value = this.applyFilters(vm, config.filters, value);
        } catch (e) {
            vm.__states.$logger.warn('Error executing filter:', e.toString(), common.onLogMessage(vm));
        }

        if (options) {
            this.extend(config, options);
        }

        if (config.isEscape) {
            value = this.escapeHtml(value);
        }

        if (config.isClean) {
            value = this.cleanValue(value);
        }

        return value;
    },

    getAttribute: function (vm, element, name, setCompiled) {
        var value;
        if (element.dirs.bind && element.dirs.bind[name]) {
            value = common.execute(
                vm,
                {
                    value: element.dirs.bind[name].value.get,
                    filters: element.dirs.bind[name].value.filters,
                },
                {
                    isEscape: false,
                    isClean: false
                }
            );
            if (setCompiled) {
                element.dirs.bind[name].isCompiled = true;
            }
        } else {
            value = common.execute(
                vm,
                element.attribs[name],
                {
                    isEscape: false,
                    isClean: false
                }
            );
        }

        return value;
    },

    applyFilters: function (vm, filters, value) {
        if (filters) {
            for (var i = 0; i < filters.length; i++) {
                value = this.applyFilter(vm, filters[i], value);
            }
        }

        return value;
    },

    applyFilter: function (vm, meta, value) {
        var filter = vm.$options.filters[meta.name];
        var replacement = function (v) {
            return v;
        };

        if (!filter) {
            vm.__states.$logger.warn('Unknown filter "' + meta.name + '"', common.onLogMessage(vm));
            filter = replacement;
        }

        if (typeof filter !== 'function') {
            filter = filter.read || replacement;
        }

        var args = [value];

        if (meta.args) {
            for (var i = 0; i < meta.args.length; i++) {
                if (!meta.args[i].dynamic) {
                    args.push(meta.args[i].value);
                } else {
                    args.push(vm.$get(meta.args[i].value));
                }
            }
        }

        return filter.apply(vm, args);
    },

    // Brand new strip function
    // Better than any "replace" version;
    escapeHtml: function (str) {
        if (typeof str === 'string') {
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        return str;
    },

    cleanValue: function (value) {
        if (value === undefined || value === null) {
            return '';
        } else {
            return value;
        }
    },

    isPresent: function (value) {
        if (value === undefined || value === null) {
            return false;
        }

        return true;
    },

    setElement: function (element) {
        // Recofigure loop due to elements order changes
        if (element) {
            element.dirs = element.dirs || {};
            return element;
        } else {
            return false;
        }
    },

    onLogMessage: function (vm) {
        if (vm.__states.$logger._config.onLogMessage) {
            return vm.__states.$logger._config.onLogMessage(vm);
        }

        return '';
    },

    extend: function () {
        return Array.prototype.reduce.call(arguments, function (previousValue, currentValue) {
            for (var item in currentValue) {
                previousValue[item] = currentValue[item];
            }

            return previousValue;
        });
    },

    composeComponent: function (component, globalMixin) {
        var options = {};
        var rawVm = {};

        options.methods = component.methods || {};

        var instancePropsMap = common.getObjectPropNames(component);

        // Walk through object-class properties and setting all functions to methods
        for (var i = instancePropsMap.length - 1; i >= 0; i--) {
            (function () {
                var name = instancePropsMap[i],
                    item = component[name];

                if (excludeInstanceOptions[name]) {
                    options[name] = item;
                } else {
                    if (typeof item === 'function') {
                        options.methods[name] = item;
                    } else {
                        rawVm[name] = item;
                    }
                }
            })();
        }

        // Global mixin via Vue.mixin = ...
        if (globalMixin) {
            options.mixins = options.mixins || [];
            options.mixins = globalMixin.concat(options.mixins);
        }

        options.template = common.prepareTemplate(options.template, 'Component\'s template');

        if (options.partials) {
            for (var name in options.partials) {
                options.partials[name] = common.prepareTemplate(
                    options.partials[name],
                    'Partial "' + name + '"'
                );
            }
        }

        return {options: options, rawVm: rawVm};
    },

    prepareTemplate: function (template, logName) {
        var tplTypeof;

        if (template) {
            tplTypeof = typeof template;

            if (tplTypeof === 'string') {
                return compiler(template);
            } else if (tplTypeof !== 'function') {
                this.$logger.warn(logName + ' type is not valid (' + tplTypeof + ')');
                return null;
            }
        } else {
            this.$logger.debug(logName + ' is empty (' + tplTypeof + ')');
        }

        return template;
    },

    // Get ALL class properties
    getObjectPropNames: function (object, isModern) {
        if (isModern) {
            return this.getObjectPropNamesModern(object);
        } else {
            return this.getObjectPropNamesLegacy(object);
        }
    },

    getObjectPropNamesLegacy: function (object) {
        var names = Object.keys(object);
        var objectProto = Object.getPrototypeOf(object);

        if (objectProto) {
            names = names.concat(
                this.getObjectPropNamesLegacy(objectProto)
            );
        }

        return names;
    },

    getObjectPropNamesModern: function (object) {
        var names = Object.keys(object).concat(gogo(object));

        function gogo(obj) {
            var objectProto = Object.getPrototypeOf(obj);
            var protoNames;

            if (objectProto && objectProto.__proto__) {
                protoNames = Object.getOwnPropertyNames(objectProto).concat(gogo(objectProto));
            }

            if (protoNames) {
                return protoNames;
            } else {
                return [];
            }
        }

        var newNames = [];
        for (var i = 0; i < names.length; i++) {
            if (names[i] === 'constructor') {
                continue;
            }

            newNames.push(names[i]);
        }

        return newNames;
    },

    dashToCamelCase: function (value) {
        return value.replace(/-(\w)/g, function (a, b) {
            return b.toUpperCase();
        });
    },

    dashToUpperCamelCase: function (value) {
        return this.dashToCamelCase(
            value.replace(/^./, function (a) {
                return a.toUpperCase();
            })
        );
    },

    camelToDashCase: function (value) {
        return value.replace(/[A-Z]/g, function (a, b) {
            if (b === 0) {
                return a.toLowerCase();
            } else {
                return '-' + a.toLowerCase();
            }
        });
    },

    size: function (value) {
        return Object.keys(value).length;
    },

    filterClassNames: function (array) {
        var seen = [];
        var result = [];

        for (var i = 0; i < array.length; i++) {
            if (!array[i]) {
                continue;
            }
            if (seen.indexOf(array[i]) === -1) {
                seen.push(array[i])
                result.push(array[i]);
            }
        }

        return result;
    }
};

module.exports = common;
