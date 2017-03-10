'use strict';

const tslint = require('tslint');
const gulp = require('gulp');
const gulpLog = require('gulplog');
const gulpTSLint = require('gulp-tslint');

const path = require('path');

var OperationTSLint = (function () {
  function OperationTSLint(config, op) {
    this.config = config;
    this.op = op;

    if (!this.config.rootDir) {
        throw new Error(`OperationTSLint: 'rootDir' is not defined`);
    }
    if (!this.op.tsLintFile) {
        throw new Error(`OperationTSLint: 'tsLintFile' is not defined`);
    }
    this.tsLintFilePath = path.join(this.config.rootDir, this.op.tsLintFile);
  }

  OperationTSLint.prototype.run = function() {
    var program = tslint.Linter.createProgram(this.tsLintFilePath);

    // activating 'type-check' by creating above 'program', I am facing some
    // warnings about from gulpTSLint and/or TSLInt:
    gulpLog.info('Please ignore the warnings `Cannot reading property "name|members|declarations|flags|exports" of undefined`');
    var self = this;
    return gulp.src(this.op.src)
      .pipe(gulpTSLint({ configuration: this.tsLintFilePath, program, tslint, formattersDirectory: 'tslint' }))
      .pipe(gulpTSLint.report())
      .on('error', function(err){
        if (self.config.options.has('continue')) {
          // hack to continue on error
          gulpLog.info('ignoring TSLINT error');
          this.emit('end');
        }
      });
  }

  OperationTSLint.prototype.watch = function () {
    return this.op.watch ? Array.isArray(this.op.src) ? this.op.src : [ this.op.src ] : [];
  }

  return OperationTSLint;
}());
module.exports.OperationTSLint = OperationTSLint;
