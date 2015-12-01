var toString     = ({}).toString,
    def          = Object.defineProperty,
    OBJECT       = 'object',
    THIS_RE      = /[^\w]this[^\w]/,
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

    /**
     * Custom Methods from Andrey Solodovnikov
     */
    extend: function () {
        var extend = function (to, from) {
            for (var i in from) {
                to[i] = from[i];
            }

            return to;
        };

        for (var arg in arguments) {
            extend(arguments[0], arguments[Number(arg) + 1]);
        }

        return arguments[0];
    },

    clone: function (source) {
        var obj = {};

        for (var arg in source) {
            obj[arg] = source[arg];
        }

        return obj;
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

    /**
     *  Convert an object to Array
     *  used in v-repeat and array filters
     */
    objectToArray: function (obj) {
        var res = [], val, data;
        for (var key in obj) {
            val = obj[key];
            data = utils.isObject(val) ?
                val
                : {$value: val};
            data.$key = key;
            res.push(data);
        }
        return res;
    }

};

enableDebug();
function enableDebug() {
    /**
     *  log for debugging
     */
    utils.log = function (msg) {
        if (console && msg) {
            console.log(msg.magenta);
        }
    };

    utils.warn = function (msg) {
        if (console && msg) {
            console.warn(msg.yellow);

            if (console.trace) {
                console.trace();
            }
        }
    };

    utils.error = function (msg) {
        if (console && console.trace) {
            console.trace();
        }

        throw msg;
    };
}
