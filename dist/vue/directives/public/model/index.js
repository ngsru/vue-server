'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../../../util/index');

var _priorities = require('../../priorities');

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _radio = require('./radio');

var _radio2 = _interopRequireDefault(_radio);

var _select = require('./select');

var _select2 = _interopRequireDefault(_select);

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlers = {
  text: _text2.default,
  radio: _radio2.default,
  select: _select2.default,
  checkbox: _checkbox2.default
};

exports.default = {

  priority: _priorities.MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && (0, _index.warn)('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && (0, _index.warn)('v-model does not support element type: ' + tag, this.vm);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },


  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = (0, _index.resolveAsset)(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },
  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};