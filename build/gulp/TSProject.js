const gulp = require('gulp');
const gulpMergeStream = require('merge-stream');
const ts = require('typescript');
const gulpTS = require('gulp-typescript');
const gulpSourcemaps = require('gulp-sourcemaps');
const tslint = require('tslint');
const gulpTSLint = require('gulp-tslint');

const path = require('path');

const helpers = require('./helpers');

var TSProject = (function () {
  function TSProject(rootDir, tsConfigFile, tsLintFile) {
    this.rootDir = rootDir;
    this.tsConfigFile = tsConfigFile;
    this.tsLintFile = tsLintFile;
    this.tsExitOnError = true;

    if (!this.rootDir) {
        throw new Error('ERROR in TSProject: \'rootDir\' is not defined');
    }
    if (!this.tsConfigFile) {
        throw new Error('ERROR in TSProject: \'tsConfigFile\' is not defined');
    }

    this.tsConfigFilePath = path.join(rootDir, this.tsConfigFile);
    this.tsConfigDirname = path.dirname(this.tsConfigFilePath);
    if (this.tsLintFile) {
      this.tsLintFilePath = path.join(rootDir, this.tsLintFile);
    }

    this.tsConfig = require(this.tsConfigFilePath);
    if (!this.tsConfig.compilerOptions.outDir) {
        throw new Error('ERROR: \'outDir\' variable is not defined in ' + this.tsConfigFile);
    }
    this.tsRootDirs = [];

    if (this.tsConfig.compilerOptions.rootDir) {
        this.tsRootDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.rootDir);
    }
    else {
        this.tsRootDir = this.tsConfigDirname;
    }
    if (this.tsConfig.compilerOptions.rootDirs) {
        this.tsConfig.compilerOptions.rootDirs.forEach((dir) => {
            this.tsRootDirs.push(path.join(this.tsConfigDirname, dir));
        });
    }
    this.tsOutDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.outDir);
    this.tsProject = gulpTS.createProject(this.tsConfigFilePath, { typescript: ts });
  }

  TSProject.prototype.taskTranspile = function() {
    if (this.tsRootDirs.length) {
      // source maps will be only configured for a single rootDir ( see 'sourceRoot' )
      throw new Error('TODO: using multiple rootDirs is not supported yet');
    }
    var relTsRootDir = path.relative(this.tsRootDir, this.tsOutDir);
    return this.tsProject.src()
      .pipe(gulpSourcemaps.init())
      .pipe(this.tsProject(gulpTS.reporter.defaultReporter()))
      .on('error', () => {
        if (this.tsExitOnError) {
          process.exit(1);
        }})
      .pipe(gulpSourcemaps.write('.', { includeContent: false, sourceRoot: relTsRootDir }))
      .pipe(gulp.dest(this.tsOutDir)).on('finish', () => {
        this.tsExitOnError = false; // do not exit in watch mode (called the second time)
      });
  }

  TSProject.prototype.taskLint = function() {
    if (!this.tsLintFilePath) {
      return;
    }
    return this.tsProject.src()
      .pipe(gulpTSLint({ configuration: this.tsLintFilePath, tslint: tslint, formattersDirectory: 'tslint' }))
      .pipe(gulpTSLint.report());
  }

  TSProject.prototype.task = function() {
    if (!this.tsLintFilePath) {
      return this.taskTranspile();
    }
    return gulpMergeStream(this.taskTranspile(), this.taskLint());
  }


  TSProject.prototype.watchings = function () {
    var w = [];
    if (this.tsRootDirs.length) {
      this.tsRootDirs.forEach((dir) => {w.push(helpers.globify(dir))});
    } else {
      w.push(helpers.globify(this.tsRootDir));
    }
    return w;
  }

  return TSProject;
}());
module.exports.TSProject = TSProject;
