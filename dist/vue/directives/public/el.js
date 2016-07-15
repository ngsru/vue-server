'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../util/index');

var _priorities = require('../priorities');

exports.default = {

  priority: _priorities.EL,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = (0, _index.camelize)(this.arg);
    var refs = (this._scope || this.vm).$els;
    if ((0, _index.hasOwn)(refs, id)) {
      refs[id] = this.el;
    } else {
      (0, _index.defineReactive)(refs, id, this.el);
    }
  },
  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};