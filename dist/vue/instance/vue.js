'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _init = require('./internal/init');

var _init2 = _interopRequireDefault(_init);

var _state = require('./internal/state');

var _state2 = _interopRequireDefault(_state);

var _events = require('./internal/events');

var _events2 = _interopRequireDefault(_events);

var _lifecycle = require('./internal/lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _misc = require('./internal/misc');

var _misc2 = _interopRequireDefault(_misc);

var _data = require('./api/data');

var _data2 = _interopRequireDefault(_data);

var _dom = require('./api/dom');

var _dom2 = _interopRequireDefault(_dom);

var _events3 = require('./api/events');

var _events4 = _interopRequireDefault(_events3);

var _lifecycle3 = require('./api/lifecycle');

var _lifecycle4 = _interopRequireDefault(_lifecycle3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
(0, _init2.default)(Vue);
(0, _state2.default)(Vue);
(0, _events2.default)(Vue);
(0, _lifecycle2.default)(Vue);
(0, _misc2.default)(Vue);

// install instance APIs
(0, _data2.default)(Vue);
(0, _dom2.default)(Vue);
(0, _events4.default)(Vue);
(0, _lifecycle4.default)(Vue);

exports.default = Vue;