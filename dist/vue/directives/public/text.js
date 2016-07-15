'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../util/index');

exports.default = {
  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },
  update: function update(value) {
    this.el[this.attr] = (0, _index._toString)(value);
  }
};