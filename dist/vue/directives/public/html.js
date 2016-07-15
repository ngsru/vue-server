'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _template = require('../../parsers/template');

var _index = require('../../util/index');

exports.default = {
  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = (0, _index.createAnchor)('v-html');
      (0, _index.replace)(this.el, this.anchor);
    }
  },
  update: function update(value) {
    value = (0, _index._toString)(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },
  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      (0, _index.remove)(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = (0, _template.parseTemplate)(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = (0, _index.toArray)(frag.childNodes);
    (0, _index.before)(frag, this.anchor);
  }
};