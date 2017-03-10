'use strict';

const gulp = require('gulp');
const gulpLog = require('gulplog');

const path = require('path');

const runSequence = require('run-sequence');

const helpers = require('./helpers');
const TaskCollection = require('./TaskCollection').TaskCollection;
const WatchTaskBuilder = require('./WatchTaskBuilder').WatchTaskBuilder;

const OPT_NO_DEPS = 'no-deps';
const OPT_WATCH_TASK = 'task';

var TaskBuilder = (function () {

  TaskBuilder.prototype.operationTypes = {
    'delete': 'OperationDelete',
    'jsonTransform':'OperationJsonTransform',
    'copyFile': 'OperationCopyFile',
    'execute': 'OperationExecute',
    'jasmine': 'OperationJasmine',
    'karma': 'OperationKarma',
    'rollup': 'OperationRollup',
    'typescript': 'OperationTSCompile',
    'tslint': 'OperationTSLint'
  }

  function TaskBuilder(config) {
    this.config = config;

    this.tasks = new TaskCollection();
    this.watch = new WatchTaskBuilder(this.config);

    gulpLog.info(`mode: ${this.config.target}`);

    let task;
    // add predefined tasks
    task = this.tasks.getTask('clean');
    task.operation = {
      type: 'delete',
      src: [helpers.globify(this.config.outDir)]
    };
    task = this.tasks.getTask('build');
    task = this.tasks.getTask('default');
    task.addDeps('build');

    task = this.tasks.getTask('rebuild');
    task.addDeps('clean');

    task = this.tasks.getTask('watch');

    task = this.tasks.getTask('help');

    this.tasks.fromJSON(this.config.tasks);
  }

  TaskBuilder.prototype.run = function () {
    // create all tasks
    this.tasks.tasks.forEach((task) => {
      try {
        this.createTask(task);
      } catch (e) {
        e.message = `ERROR: task '${task.name}': ` + (e.message || JSON.stringify(e));
        throw e;
      }
    });

  };


  TaskBuilder.prototype.createTask = function (task) {

    // console.log(`creating task '${task.name}': [${task.deps}]:\n  `, task.operation || {});

    // handle special predefined tasks, which cannot be overwritten:
    var op = undefined;
    switch (task.name) {
      case 'rebuild':
        this.addRebuildTask(task);
        return;
      case 'watch':
        this.addWatchTask(task);
        return;
      case 'help':
        this.addHelpTask(task);
        return;
    }

    // create non-operation tasks:
    if (!task.operation) {
      this.addTask(task, () => { });
      return;
    }

    if (task.operation.type == undefined) {
      throw new Error(`no operation type defined'`);
    }

    var module = this.operationTypes[task.operation.type];
    if (!module) {
      throw new Error(`unknown operation type: '${task.operation.type}'`);
    }

    // create remaining tasks:
    const OpCls = require(`./${module}`)[module];
    task.operation.name = task.name;
    var op = new OpCls(this.config, task.operation);

    this.addTask(task, (done) => {
      return op.run(done);
    });
    this.watch.addWatchGlobs(op.watch());
  }

  TaskBuilder.prototype.addRebuildTask = function (task) {
    if (task.operation) {
      throw new Error(`operation definition not allowed on this predefined task'`);
    }

    task.addDeps('build');
    var rebuildSubTasks = task.deps;
    task.clearDeps();

    this.addTask(task, (done) => {
      return runSequence(rebuildSubTasks, (err) => {done()});
    });
  }

  TaskBuilder.prototype.addWatchTask = function (task) {
    if (task.operation) {
      throw new Error(`operation definition not allowed on this predefined task'`);
    }
    if (task.deps.length) {
      throw new Error(`specifying dependencies is not allowed on the 'watch'-task (see --task option and 'task' property)`);
    }
    this.watch.addTask(this, task, this.config.options.get(OPT_WATCH_TASK));
  }

  TaskBuilder.prototype.addHelpTask = function (task) {
    if (task.operation) {
      throw new Error(`operation definition not allowed on this predefined task'`);
    }
    this.addTask(task, () => {
      this.tasks.printTasks();
    });
  }


  TaskBuilder.prototype.addTask = function (task, op) {
    gulp.task(task.name, this.config.options.has(OPT_NO_DEPS) ? [] : task.deps, op);
  }



  return TaskBuilder;
}());
module.exports.TaskBuilder = TaskBuilder;
