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
    'tslint': 'OperationTSLint',
    'sequence': 'OperationTaskSequence'
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
      this.addTask(task);
      return;
    }

    // create remaining tasks:
    if (task.operation.type == undefined) {
      throw new Error(`no operation type defined'`);
    }
    this.addStandardTask(task);
  }

  TaskBuilder.prototype.addStandardTask = function (task) {
    var module = this.operationTypes[task.operation.type];
    if (!module) {
      throw new Error(`unknown operation type: '${task.operation.type}'`);
    }

    const OpCls = require(`./${module}`)[module];
    task.operation.name = task.name;
    var op = new OpCls(this.config, task.operation);

    this.addTask(task, (done) => {
      return op.run(done);
    });
    this.watch.addWatchGlobs(op.watch());
  }

  TaskBuilder.prototype.addWatchTask = function (task) {
    if (task.operation) {
      gulpLog.info(`overwriting predefined 'watch'-task`);
      if (this.config.options.has(OPT_WATCH_TASK)) {
        throw new Error(`'task'-option not supported'`);
      } else if (task.task) {
        throw new Error(`'task'-property not supported'`);
      }
      this.addStandardTask(task);
      return;
    }
    if (task.deps.length) {
      throw new Error(`specifying dependencies is not allowed on the 'watch'-task (see --task option and 'task' property)`);
    }
    this.watch.addTask(this, task, this.config.options.get(OPT_WATCH_TASK));
  }

  TaskBuilder.prototype.addRebuildTask = function (task) {
    if (task.operation) {
      throw new Error(`operation definition not allowed on this predefined task'`);
    }

    task.addDeps('clean');
    var rebuildSubTasks = task.deps;
    task.clearDeps();

    task.operation = {
      type: 'sequence',
      sequence: [ rebuildSubTasks, 'build' ]
    };
    this.addStandardTask(task);
  }



  TaskBuilder.prototype.addHelpTask = function (task) {
    if (task.operation) {
      throw new Error(`operation definition not allowed on this predefined task'`);
    }
    this.addTask(task, (done) => {
      this.tasks.printTasks();
      done();
    });
  }


  TaskBuilder.prototype.addTask = function (task, op) {
    gulp.task(task.name, this.config.options.has(OPT_NO_DEPS) ? [] : task.deps, op);
  }



  return TaskBuilder;
}());
module.exports.TaskBuilder = TaskBuilder;
