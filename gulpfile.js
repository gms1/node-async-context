'use strict';

var config = {
  outDir: './dist',

  tasks: [
    {
      name: 'package.json',
      operation: {
        type: 'jsonTransform',
        src: 'package.json',
        transform: (data, file) => {
          delete data.scripts;
          delete data.devDependencies;
          return data;
        },
        whitespace: 2
      }
    },
    {
      name: 'dist:files',
      deps: [ 'package.json' ],
      operation: {
        type: 'copyFile',
        src: '{README.md,LICENSE,.npmignore}',
      }
    },
    {
      name: 'ts:tsc',
      operation: {
        type: 'typescript',
        watch: true,
        tsConfigFile: 'tsconfig.json'
        // tsLintFile: 'tslint.json'
      }
    },
    {
      name: 'ts:lint',
      operation: {
        type: 'tslint',
        src: './src/**/*.ts',
        tsLintFile: 'tslint.json',
      }
    },
    {
      name: 'build',
      deps: [ 'dist:files', 'ts:tsc', 'ts:lint' ]
    }
  ]

};


// add local node_modules to NODE_PATH to be able to symlink the build directory
var np = require('path').join(__dirname , '/node_modules');
process.env.NODE_PATH = process.env.NODE_PATH ? np + ':' + process.env.NODE_PATH : np;
require('module').Module._initPaths();

// run build
require('./build/gulp/index').run(__dirname, config);
