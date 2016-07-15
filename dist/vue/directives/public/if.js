'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _factory = require('../../fragment/factory');

var _factory2 = _interopRequireDefault(_factory);

var _priorities = require('../priorities');

var _index = require('../../util/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  priority: _priorities.IF,
  terminal: true,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && (0, _index.getAttr)(next, 'v-else') !== null) {
        (0, _index.remove)(next);
        this.elseEl = next;
      }
      // check main block
      this.anchor = (0, _index.createAnchor)('v-if');
      (0, _index.replace)(el, this.anchor);
    } else {
      process.env.NODE_ENV !== 'production' && (0, _index.warn)('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
      this.invalid = true;
    }
  },
  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },
  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new _factory2.default(this.vm, this.el);
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },
  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new _factory2.default(this.elseEl._context || this.vm, this.elseEl);
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },
  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
    if (this.elseFrag) {
      this.elseFrag.destroy();
    }
  }
};