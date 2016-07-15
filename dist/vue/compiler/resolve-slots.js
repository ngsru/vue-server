'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveSlots = resolveSlots;

var _template = require('../parsers/template');

var _index = require('../util/index');

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

function resolveSlots(vm, content) {
  if (!content) {
    return;
  }
  var contents = vm._slotContents = Object.create(null);
  var el, name;
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i];
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el);
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && (0, _index.getBindAttr)(el, 'slot')) {
      (0, _index.warn)('The "slot" attribute must be static.', vm.$parent);
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content);
  }
  if (content.hasChildNodes()) {
    var nodes = content.childNodes;
    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
      return;
    }
    contents['default'] = extractFragment(content.childNodes, content);
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent) {
  var frag = document.createDocumentFragment();
  nodes = (0, _index.toArray)(nodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if ((0, _index.isTemplate)(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      parent.removeChild(node);
      node = (0, _template.parseTemplate)(node, true);
    }
    frag.appendChild(node);
  }
  return frag;
}