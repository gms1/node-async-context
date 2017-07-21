'use strict';

const Task = require('./Task').Task;

class TaskCollection {
  constructor() { this.tasks = new Map(); }

  getTask(name) {
    if (this.tasks.has(name)) {
      return this.tasks.get(name);
    }
    let task = new Task(name);
    this.tasks.set(name, task);
    return task;
  }

  fromJSON(jsonTasks) {
    if (!jsonTasks) {
      throw new Error('no task defined');
    }
    let taskCounter = 0;
    jsonTasks.forEach((taskdef) => {
      taskCounter += 1;
      if (!taskdef.name) {
        throw new Error(`task ${taskCounter} has no 'name' attribute defined`);
      }
      let task = this.getTask(taskdef.name);
      task.clearDeps();
      if (taskdef.deps) {
        task.addDeps(taskdef.deps);
      }
      if (taskdef.operation) {
        task.operation = taskdef.operation;
      }
      if (task.name === 'watch') {
        if (taskdef.watch) {
          task.watch = taskdef.watch;
        }
        if (taskdef.task) {
          task.task = taskdef.task;
        }
      } else {
        if (taskdef.watch) {
          throw new Error(`'watch' property defined on task ${taskCounter} is only supported for the 'watch' task`);
        }
        if (taskdef.task) {
          throw new Error(`'task' property defined on task ${taskCounter} is only supported for the 'watch' task`);
        }
      }
    });
  }

  printTask(logged, name, indent) {
    if (logged.has(name) || !this.tasks.has(name)) {
      return;
    }
    logged.add(name);
    let task = this.getTask(name);
    let prefix = ' '.repeat(indent);
    let subTasks;
    if (task.name === 'watch' && !task.operation) {
      var buildTargets = Array.from(task.buildTargets).join(', ');
      subTasks = buildTargets + ' => (changeEvent) => ' + buildTargets;
    } else {
      subTasks = task.deps.join(', ');
      if (task.operation && task.operation.type === 'sequence') {
        subTasks += ' => ' + task.operation.sequence.join(', ');
      }
    }
    if (!subTasks.length) {
      console.log(`${prefix}${task.name}`);
    } else {
      console.log(`${prefix}${task.name}: ${subTasks}`);
    }
    indent += 2;
    task.deps.forEach((dep) => { this.printTask(logged, dep, indent); });
  }

  printTasks() {
    let logged = new Set();
    console.log('supported tasks:');
    let indent = 2;
    this.printTask(logged, 'clean', indent);
    this.printTask(logged, 'build', indent);
    this.printTask(logged, 'default', indent);
    this.printTask(logged, 'rebuild', indent);
    this.printTask(logged, 'test', indent);
    this.printTask(logged, 'watch', indent);
    this.printTask(logged, 'help', indent);
    let logTask;
    do {
      logTask = undefined;
      this.tasks.forEach((task, name) => {
        if (!logged.has(name)) {
          if (!logTask || task.deps.length > logTask.deps.length) {
            logTask = task;
          }
        }
      });
      if (logTask) {
        this.printTask(logged, logTask.name, indent);
      }
    } while (logTask);
  }
}

exports.TaskCollection = TaskCollection;
