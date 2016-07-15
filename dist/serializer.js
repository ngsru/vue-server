'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var utils = require('./utils.js');

function stringify(obj) {
    var result = '';

    var cycle = function cycle(source) {
        var sourceType = typeof source === 'undefined' ? 'undefined' : _typeof(source);

        if (sourceType !== 'object') {
            // Function & Boolean & Number
            if (sourceType === 'function' || sourceType === 'boolean' || sourceType === 'number') {
                result += source;
            } else if (source === undefined) {
                result += 'undefined';
                // String
            } else {
                result += '"' + source.replace(/"/g, '\\"') + '"';
            }
        } else {
            // Array
            if (source instanceof Array) {
                result += '[';

                (function () {
                    var item;
                    for (var i = 0; i < source.length; i++) {
                        cycle(source[i]);

                        if (i !== source.length - 1) {
                            result += ',';
                        }
                    }
                })();

                result += ']';

                // Object
            } else if (source instanceof Object) {
                var notEmpty = false;

                result += '{';

                for (var item in source) {
                    notEmpty = true;

                    result += '"' + item.replace(/"/g, '\\"') + '":';
                    cycle(source[item]);
                    result += ',';
                }

                if (notEmpty) {
                    result = result.substr(0, result.length - 1);
                }

                result += '}';

                // null
            } else if (source === null) {
                result += 'null';
            }
        }
    };

    cycle(obj);

    return result.replace(/\n|\r|\t/g, ' ');
}

module.exports = stringify;