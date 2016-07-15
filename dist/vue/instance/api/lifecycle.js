'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (Vue) {
  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && (0, _index.warn)('$mount() should be called only once.', this);
      return;
    }
    el = (0, _index.query)(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if ((0, _index.inDoc)(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   *
   * @param {Boolean} remove
   * @param {Boolean} deferCleanup
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @param {Object} [scope]
   * @param {Fragment} [frag]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return (0, _index2.compile)(el, this.$options, true)(this, el, host, scope, frag);
  };
};

var _index = require('../../util/index');

var _index2 = require('../../compiler/index');