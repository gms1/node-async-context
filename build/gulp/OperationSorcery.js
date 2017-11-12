'use strict';

const gulp = require('gulp');
const sorcery = require('sorcery');

var OperationSorcery = (function() {
  function OperationSorcery(config, op) {
    this.config = config;
    this.op = op;
    if (!this.op.file) {
      throw new Error(`OperationSorcery: 'file' is not defined`);
    }
  };

  OperationSorcery.prototype.run = function() { return build_sorcery(this.op.file); };


  OperationSorcery.prototype.watch = function() { return []; };

  return OperationSorcery;
}());
module.exports.OperationSorcery = OperationSorcery;
