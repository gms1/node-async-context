'use strict';

const ts = require('typescript');
const tslint = require('tslint');

const gulp = require('gulp');
const gulpLog = require('gulplog');
const gulpTS = require('gulp-typescript');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpTSLint = require('gulp-tslint');
const gulpMergeStream = require('merge-stream');

const path = require('path');

const helpers = require('./helpers');

var OperationTSCompile = (function () {
  function OperationTSCompile(config, op) {
    this.config = config;
    this.op = op;

    if (!this.config.rootDir) {
      throw new Error(`OperationTSCompile: 'rootDir' is not defined`);
    }
    if (!this.op.tsConfigFile) {
      throw new Error(`OperationTSCompile: 'tsConfigFile' is not defined`);
    }

    this.tsConfigFilePath = path.join(this.config.rootDir, this.op.tsConfigFile);
    this.tsConfigDirname = path.dirname(this.tsConfigFilePath);
    if (this.op.tsLintFile) {
      this.tsLintFilePath = path.join(this.config.rootDir, this.op.tsLintFile);
    }

    this.tsConfig = require(this.tsConfigFilePath);
    if (!this.tsConfig.compilerOptions.outDir) {
      throw new Error(`OperationTSCompile: 'outDir' is not defined in '${this.op.tsConfigFile}'`);
    }

    // typescripts rootDir is only used to control the output directory structure
    // so this is our base directory:
    this.tsRootDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.rootDir || '.');
  }

  OperationTSCompile.prototype.files = function () {
    const { fileNames, errors } = ts.parseJsonConfigFileContent(
      this.tsConfig,
      ts.sys,
      this.tsConfigDirname);

    for (const error of errors) {
      gulpLog.error(error.messageText);
    }
    // notes: ts.parseJsonConfigFileContent returns fileNames using absolute paths
    // console.log(`fileNames = ${fileNames}`);
    return fileNames;
  }

  OperationTSCompile.prototype.watch = function () {
    if (!this.tsConfig.include || !this.tsConfig.include.length) {
      return this.files();
    }
    var globs = [];
    this.tsConfig.include.forEach((glob) => {
      globs.push(path.join(this.tsConfigDirname, glob));
    });
    if (this.tsConfig.exclude && this.tsConfig.exclude.length) {
      this.tsConfig.exclude.forEach((glob) => {
        globs.push('!' + path.join(this.tsConfigDirname, glob));
      });
    }
    return globs;
  }



  OperationTSCompile.prototype.transpile = function () {

    var tsProject = gulpTS.createProject(this.tsConfigFilePath, { typescript: ts });

    var tsOutDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.outDir);
    var relTsRootDir = path.relative(tsOutDir, this.tsRootDir);

    var gotError = 0;
    var self = this;
    return gulp.src(this.files(), { base: this.tsRootDir })
      .pipe(gulpSourcemaps.init())
      .pipe(tsProject(gulpTS.reporter.defaultReporter()))
      .on('error', () => { gotError = 1; })
      .pipe(gulpSourcemaps.write(
        '.',
        {
          includeContent: false,
          sourceRoot: relTsRootDir,
          mapSources: (sourcePath, file) => {
            // sorry, but this seems to be the only way to get gulp-sourcemaps working
            //   file.base: tsOutDir
            //   file.relative: js-filepath relative to file.base
            var absJSDir = path.dirname(path.join(file.base, file.relative));
            var relJSDirToBaseDir = path.relative(absJSDir, file.base);

            var resSourcePath = path.join(relJSDirToBaseDir, sourcePath);
            // console.log(`sourcePath = '${resSourcePath}'`);
            return resSourcePath;
          }
        }
      ))
      .pipe(gulp.dest(tsOutDir))
      .on('finish', function () {
        if (self.config.options.has('continue')) {
          // hack to continue on error
          gulpLog.info('ignoring TS error');
          this.emit('end');
        }
        // hack to to fail with error on error (error already cleared by gulp-typescript)
        if (gotError) {
          var err = new Error('Typescript transpile failed');
          err.showStack = false;
          this.emit('error', err);
        }
      });
  }


  OperationTSCompile.prototype.lint = function () {
    if (!this.tsLintFilePath) {
      return;
    }

    return gulp.src(this.files(), { base: this.tsRootDir })
      .pipe(gulpTSLint({ configuration: this.tsLintFilePath, tslint: tslint, formattersDirectory: 'tslint' }))
      .pipe(gulpTSLint.report())
      .on('error', () => { });
  }

  OperationTSCompile.prototype.run = function () {
    if (!this.tsLintFilePath) {
      return this.transpile();
    }
    return gulpMergeStream(this.transpile(), this.lint());
  }


  return OperationTSCompile;
}());
module.exports.OperationTSCompile = OperationTSCompile;
