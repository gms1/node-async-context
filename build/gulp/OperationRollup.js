'use strict';

const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify');

const path = require('path');

var OperationRollup = (function() {
  function OperationRollup(config, op) {
    this.config = config;
    this.op = op;

    if (!this.op.rollupConfigFile) {
      throw new Error(`OperationRollup: 'rollupConfigFile' is not defined`);
    }
    if (this.op.watch) {
      throw new Error('OperationRollup: watching is not supported');
    }

    this.rollupConfigFilePath = path.join(this.config.rootDir, this.op.rollupConfigFile);
    this.rollupConfigDirname = path.dirname(this.rollupConfigFilePath);


    this.rollupConfig = require(this.rollupConfigFilePath);
    if (!this.rollupConfig.output.file)  {
      throw new Error(`OperationRollup: 'output.file' is not defined in '${this.rollupConfig}'`);
    }
  };

  OperationRollup.prototype.std = function() {
    return rollup.rollup(this.rollupConfig).then((bundle) => { return bundle.write(this.rollupConfig.output); });
  };

  OperationRollup.prototype.minified = function() {
    var rollupConfigMinified = Object.assign({}, this.rollupConfig);

    rollupConfigMinified.plugins = [].concat(rollupConfigMinified.plugins);
    rollupConfigMinified.plugins.push(uglify({output: {comments: (node, comment) => comment.value.startsWith('!')}}));
    rollupConfigMinified.output.file = rollupConfigMinified.output.file.replace(/\.js$/, '.min.js');
    return rollup.rollup(rollupConfigMinified).then((bundle) => { return bundle.write(rollupConfigMinified); });
  };

  OperationRollup.prototype.run = function() {
    if (this.op.addMinified) {
      return Promise.all([this.minified(), this.std()]);
    } else {
      return this.std();
    }
  };


  OperationRollup.prototype.watch = function() { return []; };


  return OperationRollup;
}());
module.exports.OperationRollup = OperationRollup;
