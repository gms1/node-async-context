'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');


var OperationTaskSequence = (function() {
  function OperationTaskSequence(config, op) {
    this.config = config;
    this.op = op;
  };

  OperationTaskSequence.prototype.run = function(done) { runSequence(...this.op.sequence, done); };

  OperationTaskSequence.prototype.watch = function() { return []; };

  return OperationTaskSequence;
}());
module.exports.OperationTaskSequence = OperationTaskSequence;
