'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendWithTransition = appendWithTransition;
exports.beforeWithTransition = beforeWithTransition;
exports.removeWithTransition = removeWithTransition;
exports.applyTransition = applyTransition;

var _index = require('../util/index');

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    (0, _index.before)(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    (0, _index.remove)(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !_index.transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}