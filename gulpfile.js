'use strict';

var config = {

  rootDir: __dirname,
  outDir: './dist',

  tasks: [
    {
      name: 'dist:packageJson',
      operation: {
        type: 'jsonTransform',
        src: 'package.json',
        transform: (data, file) => {
          delete data.scripts;
          data.devDependencies = data.dependencies;
          delete data.dependencies;
          return data;
        },
        whitespace: 2
      }
    },
    {
      name: 'dist:copyFiles',
      operation: {
        type: 'copyFile',
        src: '{README.md,LICENSE,.npmignore}',
      }
    },
    {
      name: 'dist:files',
      deps: [ 'dist:packageJson', 'dist:copyFiles' ],
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
    },
    {
      name: 'test',
      deps: ['build'],
      operation: {
        type: 'jasmine',
        src: './dist/**/*.spec.js'
      }
    }
  ]

};


// run:
require('./build/gulp/index').run(config);
