'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var utils = require('./../utils.js');

var common = {
    getValue: function getValue(vm, value) {
        var result;

        if (typeof value === 'function') {
            try {
                result = value.call(vm, vm);
            } catch (e) {
                vm.__states.$logger.warn('Error executing expression: ' + value.toString() + ' [' + e.toString() + ']', common.onLogMessage(vm));
            }
        } else {
            result = value;
        }

        return result;
    },

    execute: function execute(vm, value, options) {
        var result = '';

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
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

    executeSingle: function executeSingle(vm, config, options) {
        var value = this.getValue(vm, config.value);

        try {
            value = this.applyFilters(vm, config.filters, value);
        } catch (e) {
            vm.__states.$logger.warn('Error executing filter:', e.toString(), common.onLogMessage(vm));
        }

        if (options) {
            utils.extend(config, options);
        }

        if (config.isEscape) {
            value = this.escapeHtml(value);
        }

        if (config.isEscapeQuotes) {
            value = this.escapeQuotes(value);
        }

        if (config.isClean) {
            value = this.cleanValue(value);
        }

        return value;
    },

    getAttributeExpression: function getAttributeExpression(vm, element, name, setCompiled) {
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

    getAttribute: function getAttribute(vm, element, name, setCompiled) {
        var value;
        if (element.dirs.bind && element.dirs.bind[name]) {
            value = common.execute(vm, {
                value: element.dirs.bind[name].value.get,
                filters: element.dirs.bind[name].value.filters
            }, {
                isEscape: false,
                isClean: false
            });
            if (setCompiled) {
                element.dirs.bind[name].isCompiled = true;
            }
        } else {
            value = common.execute(vm, element.attribs[name], {
                isEscape: false,
                isClean: false
            });
        }

        return value;
    },

    applyFilters: function applyFilters(vm, filters, value) {
        if (filters) {
            for (var i = 0; i < filters.length; i++) {
                value = this.applyFilter(vm, filters[i], value);
            }
        }

        return value;
    },

    applyFilter: function applyFilter(vm, meta, value) {
        var filter = vm.$options.filters[meta.name];
        var replacement = function replacement(v) {
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
    escapeHtml: function escapeHtml(str) {
        if (typeof str === 'string') {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        return str;
    },

    escapeQuotes: function escapeQuotes(str) {
        if (typeof str === 'string') {
            return str.replace(/"/g, '&quot;');
        }

        return str;
    },

    cleanValue: function cleanValue(value) {
        if (value === undefined || value === null) {
            return '';
        } else {
            return value;
        }
    },

    isPresent: function isPresent(value) {
        if (value === undefined || value === null) {
            return false;
        }

        return true;
    },

    setElement: function setElement(element) {
        return element;
    },

    onLogMessage: function onLogMessage(vm) {
        if (vm.__states.$logger._config.onLogMessage) {
            return vm.__states.$logger._config.onLogMessage(vm);
        }

        return '';
    },

    dashToCamelCase: function dashToCamelCase(value) {
        return value.replace(/-(\w)/g, function (a, b) {
            return b.toUpperCase();
        });
    },

    dashToUpperCamelCase: function dashToUpperCamelCase(value) {
        return this.dashToCamelCase(value.replace(/^./, function (a) {
            return a.toUpperCase();
        }));
    },

    camelToDashCase: function camelToDashCase(value) {
        return value.replace(/[A-Z]/g, function (a, b) {
            if (b === 0) {
                return a.toLowerCase();
            } else {
                return '-' + a.toLowerCase();
            }
        });
    },

    filterClassNames: function filterClassNames(array) {
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
    }
};

module.exports = common;