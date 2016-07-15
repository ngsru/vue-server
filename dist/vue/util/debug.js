'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = undefined;

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lang = require('./lang');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var warn = void 0;
var formatComponentName = void 0;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    exports.warn = warn = function warn(msg, vm) {
      if (hasConsole && !_config2.default.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function formatComponentName(vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + (0, _lang.hyphenate)(name) + '>)' : '';
    };
  })();
}

exports.warn = warn;