// tslint:disable no-var-requires no-require-imports typedef
import { Configuration } from './Configuration';
import * as gulp from 'gulp';
import * as path from 'path';
import * as helpers from './helpers';

const gulpWatch = gulp.watch;
const gulpBatch = require('gulp-batch');
const gulpDel = require('del');
const ts = require('typescript');
const gulpTS = require('gulp-typescript');
const gulpSourcemaps = require('gulp-sourcemaps');
const tslint = require('tslint');
const gulpTSLint = require('gulp-tslint');
const gulpMergeStream = require('merge-stream');
const gulpJsonTransform = require('gulp-json-transform');


// runSequence will be obsolet after gulp 4 transistion
const runSequence = require('run-sequence');

export class TaskBuilder {
  cleanTasks: string[] = [];
  buildTasks: string[] = [];

  watches: string[] = [];
  watchRebuildTasks: string[] = [];

  constructor(public config: Configuration) {
  }

  create(): void {
    this.createPackageTasks();
    this.createTsTasks();

    gulp.task('clean', this.cleanTasks, () => { });
    gulp.task('build', this.buildTasks, () => { });

    gulp.task('rebuild', (callback: any) => {
      runSequence('clean', 'build', callback);
    });

    gulp.task('watch:rebuild', (callback: any) => {
      runSequence(...this.watchRebuildTasks, callback);
    });

    gulp.task('watch', ['build'], () => {
      gulpWatch(this.watches, gulpBatch((events: any, done: any) => { gulp.start('watch:rebuild', done); }));
    });

    gulp.task('default', ['build'], () => { });

    gulp.task('help', () => {
      console.log(`supported tasks:`);
      console.log(`  clean: ${this.cleanTasks}`);
      console.log(`  build: ${this.buildTasks}`);
      console.log(`  rebuild: clean,build`);
      console.log(`  watch: build`);
      console.log(`    on event: ${this.watchRebuildTasks}`);
    });

  }

  createPackageTasks(): void {
    if (this.config.gulpConfig.packageFiles) {
      let packageTaskName = 'pkg:prepare';
      this.buildTasks.push(packageTaskName);
      gulp.task(packageTaskName, () => {
        let transformStreams: NodeJS.ReadWriteStream[] = [];
        this.config.gulpConfig.packageFiles.forEach((file: any) => {
          if (file.jsonTransform) {
            transformStreams.push(gulp.src(file.src, { base: file.base })
              .pipe(gulpJsonTransform(file.jsonTransform, file.jsonWhitespace || 0))
              .pipe(gulp.dest(file.out)));
          } else {
            transformStreams.push(gulp.src(file.src, { base: file.base }).pipe(gulp.dest(file.out)));
          }
        });

        return gulpMergeStream(transformStreams);
      });
    }
  }


  createTsTasks(): void {
    // *** clean: ****
    let cleanTaskName = 'ts:clean';
    this.cleanTasks.push(cleanTaskName);
    // do not clean node_modules directory from dist folder to make 'npm link' happy
    let glob = [
      helpers.globify(this.config.tsOutDir),
      '!' + helpers.globify(this.config.tsOutDir, 'node_modules')
    ];
    gulp.task(cleanTaskName, [], () => { return gulpDel(glob); });

    // *** tsc: ****
    let transpileTaskName = 'ts:transpile';
    this.buildTasks.push(transpileTaskName);

    if (this.config.tsRootDirs.length) {
      // source maps will be only configured for a sinlge rootDir ( see 'sourceRoot' )
      throw new Error('TODO: using multiple rootDirs is not supported yet');
    }

    let tsProject = gulpTS.createProject(this.config.gulpConfig.tsConfigFile, { typescript: ts });
    gulp.task(transpileTaskName, () => {

      let relTsRootDir = path.relative(this.config.tsRootDir, this.config.tsOutDir);
      return tsProject.src()
        .pipe(gulpSourcemaps.init())
        .pipe(tsProject(gulpTS.reporter.longReporter()))
        .pipe(gulpSourcemaps.write('.', { includeContent: false, sourceRoot: relTsRootDir }))
        .pipe(gulp.dest(this.config.tsOutDir));
    });

    // *** tslint: ****
    let lintTaskName = 'ts:lint';
    this.buildTasks.push(lintTaskName);
    gulp.task(lintTaskName, () => {
      return tsProject.src()
        .pipe(gulpTSLint({ configuration: this.config.gulpConfig.tsLintFile, tslint, formattersDirectory: 'tslint' }))
        .pipe(gulpTSLint.report());
    });

    // *** watch: ****
    this.watchRebuildTasks.push(transpileTaskName);
    this.watches.push(helpers.globify(this.config.tsRootDir));
    this.config.tsRootDirs.forEach((dir) => {
      this.watches.push(helpers.globify(dir));
    });


  }
}
