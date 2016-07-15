'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives: _index2.default,
    elementDirectives: _index4.default,
    filters: _index6.default,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  };

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = _config2.default;
  Vue.set = _index7.set;
  Vue.delete = _index7.del;
  Vue.nextTick = _index7.nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = _factory2.default;
  Vue.internalDirectives = _index11.default;
  Vue.parsers = {
    path: path,
    text: text,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        (0, _index7.warn)('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = (0, _index7.mergeOptions)(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    _config2.default._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    /* eslint-disable no-new-func */
    return new Function('return function ' + (0, _index7.classify)(name) + ' (options) { this._init(options) }')();
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = (0, _index7.toArray)(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = (0, _index7.mergeOptions)(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  _config2.default._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (_index7.commonTagRE.test(id) || _index7.reservedTagRE.test(id))) {
            (0, _index7.warn)('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && (0, _index7.isPlainObject)(definition)) {
          definition.name = id;
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });

  // expose internal transition API
  (0, _index7.extend)(Vue.transition, transition);
};

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./directives/public/index');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('./directives/element/index');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('./filters/index');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('./util/index');

var util = _interopRequireWildcard(_index7);

var _index8 = require('./compiler/index');

var compiler = _interopRequireWildcard(_index8);

var _path = require('./parsers/path');

var path = _interopRequireWildcard(_path);

var _text = require('./parsers/text');

var text = _interopRequireWildcard(_text);

var _template = require('./parsers/template');

var template = _interopRequireWildcard(_template);

var _directive = require('./parsers/directive');

var directive = _interopRequireWildcard(_directive);

var _expression = require('./parsers/expression');

var expression = _interopRequireWildcard(_expression);

var _index9 = require('./transition/index');

var transition = _interopRequireWildcard(_index9);

var _factory = require('./fragment/factory');

var _factory2 = _interopRequireDefault(_factory);

var _index10 = require('./directives/internal/index');

var _index11 = _interopRequireDefault(_index10);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }