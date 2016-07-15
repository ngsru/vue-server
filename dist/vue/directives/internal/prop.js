'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _watcher = require('../../watcher');

var _watcher2 = _interopRequireDefault(_watcher);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _compileProps = require('../../compiler/compile-props');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bindingModes = _config2.default._propBindingModes; // NOTE: the prop internal directive is compiled and linked
// during _initProps(), before the created hook is called.
// The purpose is to make the initial prop values available
// inside `created` hooks and `data` functions.

exports.default = {
  bind: function bind() {
    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new _watcher2.default(parent, parentKey, function (val) {
      (0, _compileProps.updateProp)(child, prop, val);
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    (0, _compileProps.initProp)(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('pre-hook:created', function () {
        self.childWatcher = new _watcher2.default(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },
  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};