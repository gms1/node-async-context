'use strict';

function config(target /* 'production' or 'development' */) {

  var tsLintTask = target === 'production' ? 'ts:lint:full' : 'ts:lint';

  return {
    outDir: './dist',

    tasks: [
      {
        name: 'dist:packageJson',
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
        name: 'dist:copyFiles',
        operation: {
          type: 'copyFile',
          src: '{README.md,LICENSE,.npmignore}',
        }
      },
      {
        name: 'dist:files',
        deps: ['dist:packageJson', 'dist:copyFiles'],
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
        name: 'ts:lint:full',
        operation: {
          type: 'tslint',
          src: './src/**/*.ts',
          tsLintFile: 'tslint.full.json',
          typeChecking: true
        }
      },
      {
        name: 'build',
        deps: ['dist:files', 'ts:tsc', tsLintTask]
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
}



// run:
require('./build/gulp/index').run(config, __dirname);
