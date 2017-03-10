'use strict';

const gulp = require('gulp');


var OperationCopyFile = (function () {
  function OperationCopyFile(config, op) {
    this.config = config;
    this.op = op;
  }

  OperationCopyFile.prototype.run = function () {
    return gulp.src(this.op.src, { base: this.op.base || '.' })
      .pipe(gulp.dest(this.op.out || this.config.outDir));
  }

  OperationCopyFile.prototype.watch = function () {
    return this.op.watch ? Array.isArray(this.op.src) ? this.op.src : [ this.op.src ] : [];
  }

  return OperationCopyFile;
}());
module.exports.OperationCopyFile = OperationCopyFile;
