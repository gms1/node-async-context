# build tasks

### goal: 
add declarative build configuration for gulp to make copying and amaintaining the same build tasks for multiple projects easier and their configuration less verbose


## common options:
* --no-deps:  runs the given task without dependencies
* --production, --prod:  enable production mode
* --development, --dev: enable development mode

## config

```javascript      

var config = {
  rootDir: __dirname,
  outDir: './dist',

  // array of task definitions:
  tasks: []  
}

// run:
require('./build/gulp/index').run(config);
```      

or

```javascript      

function config(target /* 'production' or 'development' */) {
  return {
    outDir: './dist',

    // array of task definitions:
    tasks: []  
  };
}

// run:
require('./build/gulp/index').run(config, __dirname);
```   


## task definitions

#### properties:
* name: the name of the task
* deps?: array of other task names, this task depends on
* operation?: optional task operation
* watch?:  array of globs; only supported for the 'watch' task 

#### sample:

```javascript      
    {
      name: 'dist:files',
      deps: [ 'package.json' ],
      operation: {
        type: 'copyFile',
        src: '{README.md,LICENSE,.npmignore}',
        base: '.',
        out: '.',
      }
    }
```      

## task operations

#### properties:
* type: the specific type of this task

all other properties are dependend on the specific task type

### delete

#### properies: 
* src:  glob or array of globs relative to the root directory
* base?: base path relative to the root directory

#### sample:

```javascript
        operation: {
          type: 'delete',
          src: ...
        }
```

### JSON transformation

#### properies: 
* src:  glob or array of globs relative to the root directory
* base?: base path relative to the root directory
* out:  the output folder relative to the root directory
* watch?: optional boolean value to indicate if src should be watched by the watch-task
* transform: transform function
* whitespace?: number of whitespaces for indentation

#### sample:

```javascript
      operation: {
        type: 'jsonTransform',
        src: 'package.json',
        base: '.',
        out: '.',
        transform: (data, file) => {
          delete data.scripts;
          delete data.devDependencies;
          return data;
        },
        whitespace: 2,
        watch: false
      }
```
### copy files

#### properies: 
* src:  glob or array of globs relative to the root directory
* base?: base path relative to the root directory
* out:  the output folder relative to the root directory
* watch?: optional boolean value to indicate if src should be watched by the watch-task

#### sample:

```javascript
        operation: {
          type: 'copyFile',
          src: '{README.md,LICENSE,.npmignore}',
          base: '.',
          out: '.',
        }
```
### execute

#### properies: 
* bin:  the path to the executable
* args?: array of arguments
* options: see <https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options>

#### sample:

```javascript
        operation: {
          type: 'execute',
          bin: '/path/to/bin',
          args: [],
          options: {
            
          }
        }
```


### jasmine

requires the following additional packages:
* jasmine
* jasmine-spec-reporter
* gulp-jasmine

#### properies: 
* src:  glob or array of globs relative to the root directory
* watch?: optional boolean value to indicate if src should be watched by the watch-task

#### sample:

```javascript
        operation: {
          type: 'jasmine',
          src: './dist/**/*.spec.js'
        }
```

### karma

requires the following additional packages:
* karma

#### properies: 
* karmaConfigFile: path to the Karma configuration file, relative to the root directory

#### sample:

```javascript
        operation: {
          type: 'karma',
          karmaConfigFile: './karma.conf.js'
        }
```

### rollup

requires the following additional packages:
* rollup
* rollup-plugin-uglify
* rollup-plugin-node-resolve-angular
* rollup-plugin-commonjs

#### properies: 
* rollupConfigFile: path to the Rollup configuration file, relative to the root directory
* addMinified?: create an additional minified bundle using the same configuration otherwise

#### sample:

```javascript
        operation: {
          type: 'rollup',
          rollupConfigFile: './rollup.config.umd.js',
          addMinified: true
        }
```

### transpile Typescript

requires the following additional packages:
* typescript
* tslint
* gulp-typescript
* gulp-sourcemaps
* gulp-tslint

#### properies: 
* tsConfigFile:  the path to the 'tsconfig.json' relative to the root directory
* watch?: optional boolean value to indicate if src should be watched by the watch-task

#### sample:

```javascript
        operation: {
          type: 'typescript',
          watch: true,
          tsConfigFile: 'tsconfig.json'
          //optional: tsLintFile: 'tslint.json',
        }
```

### tsLint

requires the following additional packages:
* tslint
* gulp-tslint

#### properies: 
* tsLintFile:  the path to the 'tslint.json' relative to the root directory
* typeChecking?: set to true to enable rules requiring type checking
* watch?: optional boolean value to indicate if src should be watched by the watch-task

#### sample:

```javascript
        operation: {
          type: 'tslint',
          src: './src/**/*.ts',
          tsLintFile: 'tslint.json',
        }
```


### sequence

#### properies: 
* sequence:  array of tasks which should run in sequence

#### sample:

```javascript
        operation: {
          type: 'sequence',
          sequence: [ 'task1', [ 'task2.1', 'task2.2' ], 'task3' ]
        }
```
This will run in this order 'task1', 'task2.1 and task2.2 in parallel and 'task3'

## predefined tasks

### clean

can be overwritten

```javascript
    {
      name: 'clean',
      operation: {
        type: 'delete',
        src: `${outDir}/**/*`
      }
    }
```

### build

should be overwritten

```javascript
    {
      name: 'build'
    }
```

### default

can be overwritten

```javascript
    {
      name: 'default',
      deps: ['build']
    }
```

### rebuild

depends on 'clean'-task and runs the 'build'-task afterwards
dependencies can be overwritten

### watch

depends on the 'build'-task per default, waits for changes and reruns the 'build'-task again

optional properties:
* watch: glob or array of globs which should be watched
* task: task or array of tasks which should be called instead of default 'build'-task

you can use the 'task'-option:
--task=<task>

e.g: 
```
gulp watch --task=test
```



### help

prints all tasks names and their dependencies
