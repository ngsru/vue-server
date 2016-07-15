'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../../util/index');

exports.default = {
  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = (0, _index.toNumber)(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },
  update: function update(value) {
    this.el.checked = (0, _index.looseEqual)(value, this.getValue());
  }
};