'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};