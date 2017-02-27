'use strict';

const gulp = require('gulp');
const path = require('path');
const child_process = require('child_process');
const gulpJsonTransform = require('gulp-json-transform');

function globify(...paths) {
  return path.join(...paths, '**', '*');
}
module.exports.globify = globify;


function jsonTransformTask(opdef, outDir) {
  return gulp.src(opdef.src, { base: opdef.base || '.'})
    .pipe(gulpJsonTransform(opdef.transform, opdef.whitespace || 0))
    .pipe(gulp.dest(path.join(outDir, opdef.out || '.')));
}
module.exports.jsonTransformTask = jsonTransformTask;


function copyFileTask(opdef, outDir) {
  return gulp.src(opdef.src, { base: opdef.base || '.'})
    .pipe(gulp.dest(path.join(outDir, opdef.out || '.')));
}
module.exports.copyFileTask = copyFileTask;


function executeTask(opdef, done) {
  if (opdef.watch) {
    throw new Error('watching not supported for executing commands');
  }
  if (!opdef.bin) {
    throw new Error('no command specified');
  }
  if (!done) {
    throw new Error('callback not defined');
  }
  var childProcess = child_process.spawn(opdef.bin, opdef.args, opdef.options);
  if (!opdef.silent) {
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  }
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`finished: ${code}`);
      if (opdef.errMessage === undefined) {
        var cmdargs = [];
        cmdargs.push(opdef.bin);
        cmdargs.push(...opdef.args);
        done(cmdargs.join(' ') + ' failed: ' + code);
      }
      else {
        done(opdef.errMessage);
      }
    }
    else {
      done();
    }
  });
}
module.exports.executeTask = executeTask;

