const gulp = require('gulp');
const tslint = require('tslint');
const gulpTSLint = require('gulp-tslint');

const path = require('path');

const helpers = require('./helpers');

var TSLintProject = (function () {
  function TSLintProject(rootDir, tsLintFile, globs) {
    this.rootDir = rootDir;
    this.tsLintFile = tsLintFile;
    this.globs = globs;

    if (!this.rootDir) {
        throw new Error('ERROR in TSLintProject: \'rootDir\' is not defined');
    }
    if (!this.tsLintFile) {
        throw new Error('ERROR in TSLintProject: \'tsLintFile\' is not defined');
    }
    this.tsLintFilePath = path.join(rootDir, this.tsLintFile);
  }

  TSLintProject.prototype.task = function() {
    return gulp.src(this.globs)
      .pipe(gulpTSLint({ configuration: this.tsLintFilePath, tslint: tslint, formattersDirectory: 'tslint' }))
      .pipe(gulpTSLint.report());
  }

  return TSLintProject;
}());
module.exports.TSLintProject = TSLintProject;
