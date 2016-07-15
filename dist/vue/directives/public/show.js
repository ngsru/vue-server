'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../util/index');

var _index2 = require('../../transition/index');

exports.default = {
  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && (0, _index.getAttr)(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },
  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },
  apply: function apply(el, value) {
    if ((0, _index.inDoc)(el)) {
      (0, _index2.applyTransition)(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};