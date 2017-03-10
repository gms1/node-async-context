'use strict';

const gulp = require('gulp');
const gulpLog = require('gulplog');
const path = require('path');
const child_process = require('child_process');


var OperationExecute = (function () {
  function OperationExecute(config, op) {
    this.config = config;
    this.op = op;
    if (this.op.watch) {
      throw new Error('OperationExecute: watching is not supported');
    }
  }

  OperationExecute.prototype.run = function (done) {
    return execute(this.op.bin, this.op.args, this.op.options, this.op.silent, this.op.errMessage, done);
  }


  OperationExecute.prototype.execute = function (bin, args, options, silent, errMessage) {

    return new Promise((resolve, reject) => {
      if (!bin) {
        return Promise.reject('no command specified');
      }
      var childProcess = child_process.spawn(bin, args, options);
      if (!silent) {
        childProcess.stdout.on('data', (data) => {
          process.stdout.write(data);
        });
        childProcess.stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      }
      childProcess.on('close', (code) => {
        if (code !== 0) {
          if (errMessage === undefined) {
            var cmdargs = [];
            cmdargs.push(bin);
            cmdargs.push(...args);
            reject(cmdargs.join(' ') + ' failed: ' + code);
          }
          else {
            reject(errMessage);
          }
        }
        else {
          resolve();
        }
      });
    });
  }

  OperationExecute.prototype.watch = function () {
    return [];
  }

  return OperationExecute;
}());
module.exports.OperationExecute = OperationExecute;
