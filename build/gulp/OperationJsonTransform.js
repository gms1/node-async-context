'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpJsonTransform = require('gulp-json-transform');


var OperationJsonTransform = (function() {
  function OperationJsonTransform(config, op) {
    this.config = config;
    this.op = op;
  };

  OperationJsonTransform.prototype.run = function() {
    return gulp.src(this.op.src, {base: this.op.base || '.'})
        .pipe(gulpJsonTransform(
            (data, file) => {
              if (this.op.transform) data = this.op.transform(data, file);
              if (this.config.target !== 'production' && path.basename(file.path) === 'package.json') {
                if (!data.scripts) data.scripts = {};
                data.scripts.prepublishOnly = 'echo "ERROR: please build for production before publishing" && exit 1';
              }
              return data;
            },
            this.op.whitespace || 0))
        .pipe(gulp.dest(this.op.out || this.config.outDir));
  };

  OperationJsonTransform.prototype.watch = function() {
    return this.op.watch ? Array.isArray(this.op.src) ? this.op.src : [this.op.src] : [];
  };

  return OperationJsonTransform;
}());
module.exports.OperationJsonTransform = OperationJsonTransform;
