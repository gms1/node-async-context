'use strict';

const gulp = require('gulp');
const gulpWatch = gulp.watch;
const gulpBatch = require('gulp-batch');
const gulpDel = require('del');

const path = require('path');

const runSequence = require('run-sequence');

const helpers = require('./helpers');
const TaskDefinitions = require('./TaskDefinitions').TaskDefinitions;

var TaskBuilder = (function () {

  function TaskBuilder(config) {
    this.config = config;
    this.definitions = new TaskDefinitions();
    this.watch = new Set();

    if (this.config.taskConfig.tasks) {
      this.definitions.fromJSON(this.config.taskConfig.tasks);
    }

    let task;
    // add predefined tasks
    task = this.definitions.getTask('dist:clean');
    task = this.definitions.getTask('clean');
    task.addDeps('dist:clean');
    task = this.definitions.getTask('build');
    task = this.definitions.getTask('rebuild');
    task.addDeps('clean');
    task = this.definitions.getTask('default');
    task.addDeps('build');
    task = this.definitions.getTask('watch');
    task.addDeps('build');
    task = this.definitions.getTask('help');
  }

  TaskBuilder.prototype.create = function () {
    this.definitions.tasks.forEach((task, name) => {
      this.createTask(task);
    });
  };


  TaskBuilder.prototype.createTask = function (task) {

    // console.log(`creating task '${name}: ${task.deps}`);

    // handle predefined tasks:
    var op = undefined;
    switch (task.name) {
      case 'clean':
      case 'build':
      case 'default':
        op = () => { };
        break;
      case 'rebuild':
        op = () => { gulp.start('build'); };
        break;
      case 'watch':
        if (task.watch) {
          task.watch.forEach((glob) => { this.watch.add(glob); });
        }
        op = () => {
          if (this.watch.size) {
            gulpWatch(...this.watch, gulpBatch((events, done) => { gulp.start('build', done); }));
          }
        }
        break;
      case 'help':
        op = () => { this.definitions.printHelp(); };
        break;
      case 'dist:clean':
        op = () => {
          return gulpDel([
            helpers.globify(this.config.outDir),
            '!' + helpers.globify(this.config.outDir, 'node_modules')
          ]);
        };
        break;
    }
    if (!op && !task.operation) {
      // console.log(`creating noop task '${task.name}`);
      op = () => { };
    }
    if (op) {
      if (task.operation) {
        throw new Error(`operation defined for predefined task '${task.name}'`);
      }
      gulp.task(task.name, task.deps, op);
    } else {
      switch (task.operation.type) {
        case 'jsonTransform':
          gulp.task(task.name, task.deps, () => {
            return helpers.jsonTransformTask(task.operation, this.config.outDir);
          })
          break;
        case 'copyFile':
          gulp.task(task.name, task.deps, () => {
            return helpers.copyFileTask(task.operation, this.config.outDir);
          })
          break;
        case 'typescript':
          const TSProject = require('./TSProject').TSProject;
          var tsProject = new TSProject(this.config.rootDir, task.operation.tsConfigFile, task.operation.tsLintFile);
          gulp.task(task.name, task.deps, () => {
            return tsProject.task();
          })
          if (task.operation.watch) {
            tsProject.watchings().forEach((w) => {
              this.watch.add(w);
            });
            return;
          }
          break;
        case 'tslint':
          const TSLintProject = require('./TSLintProject').TSLintProject;
          var tsLintProject = new TSLintProject(this.config.rootDir, task.operation.tsLintFile, task.operation.src);
          gulp.task(task.name, task.deps, () => {
            return tsLintProject.task();
          })
          break;
        case 'execute':
          gulp.task(task.name, task.deps, (done) => {
            return helpers.executeTask(task.operation, done);
          })
          break;

        default:
          if (task.operation.type == undefined) {
            throw new Error(`no operation type defined for task '${task.name}'`);
          } else {
            throw new Error(`unknown operation type '${task.operation.type}' defined for task '${task.name}'`);
          }
          break;
      }
      if (task.operation.watch) {
        this.watch.add(task.operation.src);
        return;
      }
    }
  }

  return TaskBuilder;
}());
module.exports.TaskBuilder = TaskBuilder;
