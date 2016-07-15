'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../util/index');

exports.default = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && (0, _index.warn)('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
  }
};