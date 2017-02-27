'use strict';

const path = require('path');


var Configuration = (function () {
  function Configuration(rootDir, taskConfig) {

    this.rootDir = rootDir;

    // package.json:
    this.packageConfig = require(path.join(rootDir, 'package.json'));

    // taskConfig
    this.taskConfig = taskConfig;


    this.outDir = path.join(this.rootDir, this.taskConfig.outDir);

    // TODO: allow to define additional watch globs ( e.g for packages installed in node_modules)
  }


  return Configuration;
}());
module.exports.Configuration = Configuration;
