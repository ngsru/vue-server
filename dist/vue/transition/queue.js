'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushJob = pushJob;

var _index = require('../util/index');

var queue = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue.push(job);
  if (!queued) {
    queued = true;
    (0, _index.nextTick)(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue.length; i++) {
    queue[i]();
  }
  queue = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}