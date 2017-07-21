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

  OperationSorcery.prototype.run = function() {
    return sorcery.load(this.op.file)
        .then(function(chain) {
          if (chain) {
            return chain.write();
          }
          console.log(`OperationSorcery: failed to read '${this.op.file}': no data`);
          return;
        })
        .catch((e) => { console.log(`OperationSorcery: failed to read '${this.op.file}': no load`); });
  };


  OperationSorcery.prototype.watch = function() { return []; };

  return OperationSorcery;
}());
module.exports.OperationSorcery = OperationSorcery;
