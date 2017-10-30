var utils = require('./../utils.js');

var common = {
    getValue: function (vm, value) {
        var result;

        if (typeof value === 'function') {
            try {
                result = value.call(vm, vm);
            } catch (e) {
                vm.__states.$logger.warn(
                    'Error executing expression: ' + value.toString() + ' [' + e.toString() + ']',
                    common.getVmInitPath(vm),
                    common.onLogMessage(vm)
                );
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
            vm.__states.$logger.warn(
                'Error executing filter:', e.toString(),
                common.getVmInitPath(vm),
                common.onLogMessage(vm)
            );
        }

        if (options) {
            utils.extend(config, options);
        }

        if (config.isEscape) {
            value = this.escapeHtml(value);
        }

        if (config.isClean) {
            value = this.cleanValue(value);
        }

        return value;
    },

    getAttributeExpression: function (vm, element, name, setCompiled) {
        if (element.attribs[name]) {
            return element.attribs[name];
        }

        if (element.dirs.bind && element.dirs.bind[name]) {
            if (setCompiled) {
                element.dirs.bind[name].isCompiled = true;
            }
            return {
                value: element.dirs.bind[name].value.get,
                filters: element.dirs.bind[name].value.filters
            };
        }
        return null;
    },

    getAttribute: function (vm, element, name, setCompiled) {
        var value;
        if (element.dirs.bind && element.dirs.bind[name]) {
            value = common.execute(
                vm,
                {
                    value: element.dirs.bind[name].value.get,
                    filters: element.dirs.bind[name].value.filters
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
            vm.__states.$logger.warn(
                'Unknown filter "' + meta.name + '"',
                common.getVmInitPath(vm),
                common.onLogMessage(vm)
            );
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
        return element;
    },

    onLogMessage: function (vm) {
        if (vm.__states.$logger._config.onLogMessage) {
            return vm.__states.$logger._config.onLogMessage(vm);
        }

        return '';
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

    filterClassNames: function (array) {
        var seen = [];
        var result = [];

        for (var i = 0; i < array.length; i++) {
            if (!array[i]) {
                continue;
            }
            if (seen.indexOf(array[i]) === -1) {
                seen.push(array[i]);
                result.push(array[i]);
            }
        }

        return result;
    },

    getVmInitPath: function (vm, path) {
        if (!path) {
            path = vm.__states.initName;
        } else {
            path = vm.__states.initName + '/' + path;
        }
        if (vm.__states.parent) {
            return this.getVmInitPath(vm.__states.parent, path);
        } else {
            return '[' + path + ']';
        }
    }
};

module.exports = common;
