'use strict';

const path = require('path');
const Configuration = require('./Configuration').Configuration;
const TaskBuilder = require('./TaskBuilder').TaskBuilder;

module.exports.run = function(rootDir, taskConfig) {

  var config = new Configuration(rootDir, taskConfig);
  var taskBuilder = new TaskBuilder(config);
  taskBuilder.create();
}


