'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _if = require('../public/if');

var _if2 = _interopRequireDefault(_if);

var _factory = require('../../fragment/factory');

var _factory2 = _interopRequireDefault(_factory);

var _priorities = require('../priorities');

var _index = require('../../util/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  priority: _priorities.PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      _if2.default.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = (0, _index.createAnchor)('v-partial');
    (0, _index.replace)(this.el, this.anchor);
    this.insert(this.params.name);
  },
  insert: function insert(id) {
    var partial = (0, _index.resolveAsset)(this.vm.$options, 'partials', id, true);
    if (partial) {
      this.factory = new _factory2.default(this.vm, partial);
      _if2.default.insert.call(this);
    }
  },
  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};