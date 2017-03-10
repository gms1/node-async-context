'use strict';

const gulp = require('gulp');
const gulpWatch = gulp.watch;
const gulpBatch = require('gulp-batch');
const gulpLog = require('gulplog');
const runSequence = require('run-sequence');


var WatchTaskBuilder = (function () {


  function WatchTaskBuilder(config) {
    this.config = config;
    this.watchGlobs = new Set();
    this.buildTargets = new Set();
  }

  // add globs to our 'watchGlobs' property
  WatchTaskBuilder.prototype.addWatchGlobs = function (globs) {
    globs.forEach((glob) => { this.watchGlobs.add(glob); });
  }

  // add build targets to our 'buildTargets' property
  WatchTaskBuilder.prototype.addBuildTargets = function (targets) {
    if (Array.isArray(targets)) {
      targets.forEach((target) => this.buildTargets.add(target));
    } else {
      this.buildTargets.add(targets);
    }
  }

  // initialize 'buildTargets' property
  WatchTaskBuilder.prototype.initBuildTargets = function(taskOption) {
    this.buildTargets.clear();

    // option --task:
    if (taskOption) {
      this.addBuildTargets(taskOption.split(','));
      if (!this.buildTargets.size) {
        throw new Error(`option '${OPT_WATCH_TASK}' has no task defined`);
      }
      return;
    }

    // task property:
    if (this.task.task) {
      this.addBuildTargets(this.task.task);
    }

    // default:
    if (!this.buildTargets.size) {
      this.addBuildTargets('build');
    }

  }

  WatchTaskBuilder.prototype.addTask = function (taskBuilder, task, taskOption) {
    this.task = task;
    this.initBuildTargets(taskOption);

    // additional watch globs may have been defined for watch-task:
    if (this.task.watch) {
      this.addWatchGlobs(this.task.watch);
    }

    // we are going to run all tasks from the callback of the watch-task
    // in this callback we are able to always resume on error
    // without having to worry about adding the 'continue' options on the command line
    // which btw does seem to be broken
    // ( see hacks in OperationTSCompile, OperationTSLint,... for the hack regarding the 'continue' option )

    var runBuildTargets = (buildDone) => {
      runSequence(Array.from(this.buildTargets), function(err) {
        if (err) {
          gulpLog.error('!!! FAILED !!!');
          // this.emit('end');
        } else {
          gulpLog.info('SUCCEEDED');
        }
        buildDone();
      });
    }

    var waitForChanges = (waitDone) => {
      if (!this.watchGlobs.size) {
        gulpLog.error('nothing to watch');
        waitDone();
      }
      gulpWatch(
        Array.from(this.watchGlobs),
        gulpBatch((events, batchDone) => {
          runBuildTargets(batchDone);
        })
      );
    }

    taskBuilder.addTask(this.task, (done) => {
      runBuildTargets(() => {
        waitForChanges(done);
      });
    });

  }

  return WatchTaskBuilder;
}());
module.exports.WatchTaskBuilder = WatchTaskBuilder;
