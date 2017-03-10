'use strict';

const gulp = require('gulp');
const gulpDel = require('del');
const helpers = require('./helpers');

var OperationDelete = (function () {
  function OperationDelete(config, op) {
    this.config = config;
    this.op = op;
    if (this.op.watch) {
      throw new Error('OperationDelete: watching is not supported');
    }
  }

  OperationDelete.prototype.run = function () {
    var globs = this.op.src || []
    if (this.op.name === 'clean') {
      // do not allow deleting 'node_modules' to make 'npm link' happy
      globs.push('!' + helpers.globify(this.config.outDir, 'node_modules'));
    }
    return gulpDel(this.op.src);
  }

  OperationDelete.prototype.watch = function () {
    return [];
  }

  return OperationDelete;
}());
module.exports.OperationDelete = OperationDelete;
