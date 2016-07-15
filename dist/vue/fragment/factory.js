'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FragmentFactory;

var _index = require('../compiler/index');

var _index2 = require('../util/index');

var _template = require('../parsers/template');

var _fragment = require('./fragment');

var _fragment2 = _interopRequireDefault(_fragment);

var _cache = require('../cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var linkerCache = new _cache2.default(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */

function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || (0, _index2.isTemplate)(el) && !el.hasAttribute('v-if')) {
    template = (0, _template.parseTemplate)(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : (0, _index2.getOuterHTML)(el));
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = (0, _index.compile)(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = (0, _index.compile)(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = (0, _template.cloneNode)(this.template);
  return new _fragment2.default(this.linker, this.vm, frag, host, scope, parentFrag);
};