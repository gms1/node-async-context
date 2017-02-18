// tslint:disable no-var-requires no-require-imports typedef
import * as path from 'path';

export class Configuration {
  rootDir: string;

  packageConfig: any;
  gulpConfig: any;
  tsConfig: any;
  tsLintConfig: any;

  tsConfigDirname: string;

  tsBaseUrl: string;
  tsRootDir: string;
  tsRootDirs: string[] = [];
  tsOutDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;

    // package.json:
    this.packageConfig = require(path.join(rootDir, 'package.json'));

    // gulpconfig.json:
    this.gulpConfig = require(path.join(rootDir, 'gulpconfig'));
    if (!this.gulpConfig.tsConfigFile) {
      throw new Error(`ERROR in Configuration: "tsConfigFile" variable is not defined in ${this.gulpConfig}`);
    }
    if (!this.gulpConfig.tsLintFile) {
      throw new Error(`ERROR in Configuration: "tsLintFile" variable is not defined in ${this.gulpConfig}`);
    }

    // tslint.json
    this.tsLintConfig = require(path.join(rootDir, this.gulpConfig.tsLintFile));

    // tsconfig.json:
    this.tsConfig = require(path.join(rootDir, this.gulpConfig.tsConfigFile));

    this.tsConfigDirname = path.join(rootDir, path.dirname(this.gulpConfig.tsConfigFile));
    if (!this.tsConfig.compilerOptions.outDir) {
      throw new Error(`ERROR in Configuration: "outDir" variable is not defined in ${this.gulpConfig.tsConfigFile}`);
    }

    if (this.tsConfig.compilerOptions.tsBaseUrl) {
      this.tsBaseUrl = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.tsBaseUrl);
    } else {
      this.tsBaseUrl = this.tsConfigDirname;
    }
    if (this.tsConfig.compilerOptions.rootDir) {
      this.tsRootDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.rootDir);
    } else {
      this.tsRootDir = this.tsConfigDirname;
    }
    if (this.tsConfig.compilerOptions.rootDirs) {
      this.tsConfig.compilerOptions.rootDirs.forEach((dir: string) => {
        this.tsRootDirs.push(path.join(this.tsConfigDirname, dir));
      });
    }
    this.tsOutDir = path.join(this.tsConfigDirname, this.tsConfig.compilerOptions.outDir);
  }


}

