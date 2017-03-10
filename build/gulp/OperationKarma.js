'use strict';

const karmaServer = require('karma').Server;
const karmaStopper = require('karma').stopper;
const path = require('path');

const defaultTimeout = 10000;

var OperationKarma = (function () {
  function OperationKarma(config, op) {
    this.config = config;
    this.op = op;

    this.timeout = this.op.timeout || defaultTimeout;

    if (!this.config.rootDir) {
        throw new Error(`OperationKarma: 'rootDir' is not defined`);
    }
    if (!this.op.karmaConfigFile) {
        throw new Error(`OperationKarma: 'karmaConfigFile' is not defined`);
    }
    if (this.op.watch) {
      throw new Error('OperationKarma: watching is not supported');
    }
    this.karmaConfigFilePath = path.join(this.config.rootDir, this.op.karmaConfigFile);

  }

  OperationKarma.prototype.waitTimeout = function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
        karmaStopper.stop({configFile: this.karmaConfigFilePath});
      }, this.timeout );
    });
  }

  OperationKarma.prototype.start = function () {
    return new Promise((resolve, reject) => {
      karmaServer.start({
        configFile: this.karmaConfigFilePath,
        singleRun: true
      }, (exitCode) => {
        if (!exitCode) {
          return resolve();
        } else {
          return reject(new Error(`OperationKarma: exited with ${exitCode}`));
        }
      });
    });
  }

  OperationKarma.prototype.run = function () {
    return Promise.race([this.start(), this.waitTimeout().then(() => {
      var sec = this.timeout/1000;
      throw new Error(`OperationKarma: timed out after ${sec} seconds`);
    })])
  }

  OperationKarma.prototype.watch = function () {
    return [];
  }

  return OperationKarma;
}());
module.exports.OperationKarma = OperationKarma;
