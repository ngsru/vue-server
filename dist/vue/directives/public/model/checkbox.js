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
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? (0, _index.toNumber)(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if ((0, _index.isArray)(model)) {
        var val = self.getValue();
        if (el.checked) {
          if ((0, _index.indexOf)(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },
  update: function update(value) {
    var el = this.el;
    if ((0, _index.isArray)(value)) {
      el.checked = (0, _index.indexOf)(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = (0, _index.looseEqual)(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};