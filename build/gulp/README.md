
## common task definition

#### properties:
* name: the name of the task
* deps?: array of other task names, this task depends on
* operation?: optional task operation

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
    },
```      

additional property supported only for 'watch' task:
* watch: array of globs 

## task operations

#### properties:
* type: the specific type of this task
* all other options are dependend on the specific task type

* src:  glob or array of globs relative to the root directory
* base: base path relative to the root directory
* out:  the output folder relative to the root directory
* watch: optional boolean value to indicate if src should be watched by the watch-task

### JSON transformation

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

```javascript
        operation: {
          type: 'copyFile',
          src: '{README.md,LICENSE,.npmignore}',
          base: '.',
          out: '.',
        }
```
### transpile Typescript

```javascript
        operation: {
          type: 'typescript',
          watch: true,
          tsConfigFile: 'tsconfig.json'
          //optional: tsLintFile: 'tslint.json',
        }
```
> 'watch' will only watch *.ts files under 'rootDir' or 'rootDirs'; explicit 'files', 'exclude' and 'include' sections in the tsconfig.json are ignored

### tsLint

```javascript
        operation: {
          type: 'tslint',
          src: './src/**/*.ts',
          tsLintFile: 'tslint.json',
        }
```
### execute

```javascript
        operation: {
          type: 'execute',
          bin: './path/to/bin',
          args: [],
          options: {
            
          }
        }
```

see 
<https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options>
for additional options
