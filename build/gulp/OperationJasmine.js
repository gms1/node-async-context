'use strict';

const gulp = require('gulp');
const gulpJasmine = require('gulp-jasmine');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

var OperationJasmine = (function() {
  function OperationJasmine(config, op) {
    this.config = config;
    this.op = op;
  };

  OperationJasmine.prototype.run = function() {
    return gulp.src(this.op.src).pipe(gulpJasmine({reporter: new SpecReporter()}));
  };

  OperationJasmine.prototype.watch = function() {
    return this.op.watch ? Array.isArray(this.op.src) ? this.op.src : [this.op.src] : [];
  };

  return OperationJasmine;
}());
module.exports.OperationJasmine = OperationJasmine;
