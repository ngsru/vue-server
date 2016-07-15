'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global MutationObserver */

// can we use __proto__?
var hasProto = exports.hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = exports.inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = exports.devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE9 = exports.isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isAndroid = exports.isAndroid = UA && UA.indexOf('android') > 0;
var isIos = exports.isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var isWechat = exports.isWechat = UA && UA.indexOf('micromessenger') > 0;

var transitionProp = void 0;
var transitionEndEvent = void 0;
var animationProp = void 0;
var animationEndEvent = void 0;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  exports.transitionProp = transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  exports.transitionEndEvent = transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  exports.animationProp = animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  exports.animationEndEvent = animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

exports.transitionProp = transitionProp;
exports.transitionEndEvent = transitionEndEvent;
exports.animationProp = animationProp;
exports.animationEndEvent = animationEndEvent;

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = exports.nextTick = function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !(isWechat && isIos)) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
}();

var _Set = void 0;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  exports._Set = _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  exports._Set = _Set = function _Set() {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

exports._Set = _Set;