'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../util/index');

var _priorities = require('../priorities');

var _transition = require('../../transition/transition');

var _transition2 = _interopRequireDefault(_transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  priority: _priorities.TRANSITION,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = (0, _index.resolveAsset)(this.vm.$options, 'transitions', id);
    id = id || 'v';
    el.__v_trans = new _transition2.default(el, id, hooks, this.vm);
    if (oldId) {
      (0, _index.removeClass)(el, oldId + '-transition');
    }
    (0, _index.addClass)(el, id + '-transition');
  }
};