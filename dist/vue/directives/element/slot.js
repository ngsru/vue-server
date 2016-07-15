'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _priorities = require('../priorities');

var _index = require('../../util/index');

exports.default = {

  priority: _priorities.SLOT,
  params: ['name'],

  bind: function bind() {
    // this was resolved during component transclusion
    var name = this.params.name || 'default';
    var content = this.vm._slotContents && this.vm._slotContents[name];
    if (!content || !content.hasChildNodes()) {
      this.fallback();
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm);
    }
  },
  compile: function compile(content, context, host) {
    if (content && context) {
      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        var elseBlock = document.createElement('template');
        elseBlock.setAttribute('v-else', '');
        elseBlock.innerHTML = this.el.innerHTML;
        // the else block should be compiled in child scope
        elseBlock._context = this.vm;
        content.appendChild(elseBlock);
      }
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      (0, _index.replace)(this.el, content);
    } else {
      (0, _index.remove)(this.el);
    }
  },
  fallback: function fallback() {
    this.compile((0, _index.extractContent)(this.el, true), this.vm);
  },
  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};