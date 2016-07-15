'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

var _for = require('./for');

var _for2 = _interopRequireDefault(_for);

var _if = require('./if');

var _if2 = _interopRequireDefault(_if);

var _show = require('./show');

var _show2 = _interopRequireDefault(_show);

var _index = require('./model/index');

var _index2 = _interopRequireDefault(_index);

var _on = require('./on');

var _on2 = _interopRequireDefault(_on);

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

var _el = require('./el');

var _el2 = _interopRequireDefault(_el);

var _ref = require('./ref');

var _ref2 = _interopRequireDefault(_ref);

var _cloak = require('./cloak');

var _cloak2 = _interopRequireDefault(_cloak);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// must export plain object

// attributes

// two-way binding
exports.default = {
  text: _text2.default,
  html: _html2.default,
  'for': _for2.default,
  'if': _if2.default,
  show: _show2.default,
  model: _index2.default,
  on: _on2.default,
  bind: _bind2.default,
  el: _el2.default,
  ref: _ref2.default,
  cloak: _cloak2.default
};
// cloak

// ref & el

// event handling

// logic control
// text & html