'use strict';
const path = require('path');


function adjustNodePath(rootDir) {
  // add local node_modules to NODE_PATH to be able to symlink the build directory
  var localNodePath = path.join(rootDir , '/node_modules');
  process.env.NODE_PATH = process.env.NODE_PATH ? localNodePath + ':' + process.env.NODE_PATH : localNodePath;
  require('module').Module._initPaths();
}

function setTarget(config) {
  var isProd = (config.options.has('production') || config.options.has('prod')) ? true : false;
  var isDev  = (config.options.has('development') || config.options.has('dev')) ? true : false;
  if (isProd && isDev) {
    throw new Error(`ERROR: either set 'development' or 'production' mode`);
  }
  config.target = isProd ? 'production' : 'development';
}


module.exports.run = function(config) {
  if (!config.rootDir) {
    throw new Error(`'rootDir' property not defined in config`);
  }
  if (!config.outDir) {
    throw new Error(`'outDir' property not defined in config`);
  }

  // load modules:
  adjustNodePath(config.rootDir);
  config.options = require('gulp-options');
  config.packageConfig = require(path.join(config.rootDir, 'package.json'));

  // set additional config settings:
  setTarget(config);

  // run a newly instantiated TaskBuilder
  const TaskBuilder = require('./TaskBuilder').TaskBuilder;
  var taskBuilder = new TaskBuilder(config);
  taskBuilder.run();
}


