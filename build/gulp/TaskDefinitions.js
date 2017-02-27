'use strict';

const Task = require('./Task').Task;

class TaskDefinitions {

  constructor() {
    this.tasks = new Map();
  }

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
      if (taskdef.parent) {
        let parentTask = this.getTask(taskdef.parent);
        parentTask.addDeps([task.name]);
      }
      if (taskdef.deps) {
        task.addDeps(taskdef.deps);
      }
      if (taskdef.operation) {
        task.operation = taskdef.operation;
      }
      if (taskdef.watch) {
        if (task.name === 'watch') {
          task.watch = taskdef.watch;
        } else {
          throw new Error(`'watch' property defined on task ${taskCounter} is only supported for teh 'watch' task`);
        }
      }
    });
  }

  printTask(logged, name, indent) {
    if (logged.has(name)) {
      return;
    }
    logged.add(name);
    let task = this.getTask(name);
    if (!task.deps.length) {
      return;
    }
    let prefix = ' '.repeat(indent);
    if (task.name === 'rebuild') {
      console.log(`${prefix}${task.name}: clean,build`);
    } else {
      console.log(`${prefix}${task.name}: ${task.deps}`);
    }
    indent += 2;
    task.deps.forEach((dep) => {
      this.printTask(logged, dep, indent);
    });
  }

  printHelp() {
    let logged = new Set();
    console.log('supported tasks:');
    let indent = 2;
    this.printTask(logged, 'clean', indent);
    this.printTask(logged, 'build', indent);
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

exports.TaskDefinitions = TaskDefinitions;
