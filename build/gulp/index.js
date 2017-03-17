'use strict';
const path = require('path');


function adjustNodePath(rootDir) {
  // add local node_modules to NODE_PATH to be able to symlink the build directory
  var localNodePath = path.join(rootDir , '/node_modules');
  process.env.NODE_PATH = process.env.NODE_PATH ? localNodePath + ':' + process.env.NODE_PATH : localNodePath;
  require('module').Module._initPaths();
}

function getTarget(options) {
  var isProd = (options.has('production') || options.has('prod')) ? true : false;
  var isDev  = (options.has('development') || options.has('dev')) ? true : false;
  if (isProd && isDev) {
    throw new Error(`ERROR: either use 'development' or 'production' mode`);
  }
  return isProd ? 'production' : 'development';
}


module.exports.run = function(config, rootDir) {
  if (typeof config === 'function') {
    if (!rootDir) {
      throw new Error(`missing 'rootDir' argument`);
    }
    adjustNodePath(rootDir);
    const options = require('gulp-options');
    const target = getTarget(options);
    config = config(target);
    config.rootDir = rootDir;
    config.options = options;
    config.target = target;
  } else {
    if (rootDir) {
      config.rootDir = rootDir;
    } else {
      if (!config.rootDir) {
        throw new Error(`'rootDir' property not defined in config`);
      }
    }
    adjustNodePath(config.rootDir);
    config.options = require('gulp-options');
    config.target = getTarget(config.options);
  }

  if (!config.outDir) {
    throw new Error(`'outDir' property not defined in config`);
  }

  config.packageConfig = require(path.join(config.rootDir, 'package.json'));

  // run a newly instantiated TaskBuilder
  const TaskBuilder = require('./TaskBuilder').TaskBuilder;
  var taskBuilder = new TaskBuilder(config);
  taskBuilder.run();
}


