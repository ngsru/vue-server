var toString = ({}).toString,
    def = Object.defineProperty,
    OBJECT = 'object',
    THIS_RE = /[^\w]this[^\w]/,
    BRACKET_RE_S = /\['([^']+)'\]/g,
    BRACKET_RE_D = /\["([^"]+)"\]/g,
    ViewModel; // late def

/**
 *  Normalize keypath with possible brackets into dot notations
 */
function normalizeKeypath(key) {
    return key.indexOf('[') < 0 ?
        key
        : key.replace(BRACKET_RE_S, '.$1')
            .replace(BRACKET_RE_D, '.$1');
}

var utils = module.exports = {

    /**
     *  get a value from an object keypath
     */
    get: function (obj, key) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key);
        if (key.indexOf('.') < 0) {
            return obj[key];
        }
        var path = key.split('.'),
            d = -1, l = path.length;
        while (++d < l && obj) {
            obj = obj[path[d]];
        }
        return obj;
    },

    /**
     *  set a value to an object keypath
     */
    set: function (obj, key, val) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key);
        if (key.indexOf('.') < 0) {
            obj[key] = val;
            return;
        }
        var path = key.split('.'),
            d = -1, l = path.length - 1;
        while (++d < l) {
            if (obj[path[d]] === null) {
                obj[path[d]] = {};
            }
            obj = obj[path[d]];
        }
        obj[path[d]] = val;
    },

    /**
     *  Create a prototype-less object
     *  which is a better hash/map
     */
    hash: function () {
        return Object.create(null);
    },

    /**
     *  A less bullet-proof but more efficient type check
     *  than Object.prototype.toString
     */
    isObject: function (obj) {
        return typeof obj === OBJECT && obj && !Array.isArray(obj);
    },

    /**
     *  filter an array with duplicates into uniques
     */
    unique: function (arr) {
        var hash = utils.hash(),
            i = arr.length,
            key, res = [];
        while (i--) {
            key = arr[i];
            if (hash[key]) {
                continue;
            }
            hash[key] = 1;
            res.push(key);
        }
        return res;
    },

    /**
     *  Most simple bind
     *  enough for the usecase and fast than native bind()
     */
    bind: function (fn, ctx) {
        return function () {
            return fn.apply(ctx, arguments);
        };
    },

    extend: function () {
        return Array.prototype.reduce.call(arguments, function (previousValue, currentValue) {
            for (var item in currentValue) {
                previousValue[item] = currentValue[item];
            }

            return previousValue;
        });
    },

    clone: function (object) {
        return this.extend({}, object);
    },

    cloneFull: function (obj) {
        function clone(obj) {
            var copy;

            // Handle the 3 simple types, and null or undefined
            if (null === obj || 'object' != typeof obj) {
                return obj;
            }

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = clone(obj[attr]);
                    }
                }
                return copy;
            }

            throw new Error('Unable to copy obj! Its type isn\'t supported.');
        }

        return clone(obj);
    },

    // Runs objects
    each: function (object, callback) {
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            callback(object[keys[i]], keys[i]);
        }
    },

    // Runs arrays and objects
    every: function (value, callback) {
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                callback(value[i], i);
            }
        } else {
            var keys = Object.keys(value);
            for (var i = 0; i < keys.length; i++) {
                callback(value[keys[i]], i, keys[i]);
            }
        }
    },

    size: function (value) {
        return Object.keys(value).length;
    },

    // For debuging (to trace problems)
    recostructTag: function (element) {
        if (element.type === 'partial') {
            return '{{> ' + element.name + '}}';
        }

        var tag = '<' + element.name;

        // Walk though tag attributes, collect vue directives
        for (var key in element.attribs) {
            tag += ' ' + key + '="';

            if (typeof element.attribs[key] === 'function') {
                tag += '[expression]';
            } else {
                tag += element.attribs[key];
            }

            tag += '"';
        }

        tag += '>';

        return tag;
    },

    last: function (array) {
        if (Array.isArray(array) && array.length) {
            return array[array.length - 1];
        }
        return null
    }
};
