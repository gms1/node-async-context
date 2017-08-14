'use strict';

const path = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');


var OperationReplace = (function() {
  function OperationReplace(config, op) {
    this.config = config;
    this.op = op;
  };

  OperationReplace.prototype.run = function() {
    return gulp.src(this.op.src, {base: this.op.base || '.'})
        .pipe(replace(this.op.search, this.op.replace))
        .pipe(gulp.dest(this.op.out || this.config.outDir));
  };

  OperationReplace.prototype.watch = function() {
    return this.op.watch ? Array.isArray(this.op.src) ? this.op.src : [this.op.src] : [];
  };

  return OperationReplace;
}());
module.exports.OperationReplace = OperationReplace;
