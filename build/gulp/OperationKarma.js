'use strict';

const KarmaServer = require('karma').Server;
const karmaStopper = require('karma').stopper;
const path = require('path');

const defaultTimeout = 100000;

// I have a similar issue, but this is alread closed:
// Karma doesn't exit properly when using public api with the finish callback #1035
// https://github.com/karma-runner/karma/issues/1035


var OperationKarma = (function() {
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
  };

  OperationKarma.prototype.start = function() {
    return new Promise((resolve, reject) => {
      var server =
          new KarmaServer({configFile: this.karmaConfigFilePath, singleRun: true, retryLimit: 0}, (exitCode) => {
            if (!exitCode) {
              return resolve();
            } else {
              return reject(new Error(`OperationKarma: exited with ${exitCode}`));
            }
          });
      server.start();
    });
  };

  OperationKarma.prototype.run = function() { return this.start(); };

  OperationKarma.prototype.watch = function() { return []; };

  return OperationKarma;
}());
module.exports.OperationKarma = OperationKarma;
