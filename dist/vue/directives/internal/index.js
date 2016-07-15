'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _style = require('./style');

var _style2 = _interopRequireDefault(_style);

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _prop = require('./prop');

var _prop2 = _interopRequireDefault(_prop);

var _transition = require('./transition');

var _transition2 = _interopRequireDefault(_transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  style: _style2.default,
  'class': _class2.default,
  component: _component2.default,
  prop: _prop2.default,
  transition: _transition2.default
};