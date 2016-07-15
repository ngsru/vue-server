'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = require('./instance/vue');

var _vue2 = _interopRequireDefault(_vue);

var _globalApi = require('./global-api');

var _globalApi2 = _interopRequireDefault(_globalApi);

var _index = require('./util/index');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _globalApi2.default)(_vue2.default);

_vue2.default.version = '1.0.24';

exports.default = _vue2.default;

// devtools global hook
/* istanbul ignore next */

setTimeout(function () {
  if (_config2.default.devtools) {
    if (_index.devtools) {
      _index.devtools.emit('init', _vue2.default);
    } else if (process.env.NODE_ENV !== 'production' && _index.inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);