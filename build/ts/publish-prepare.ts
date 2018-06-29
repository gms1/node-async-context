import * as path from 'path';
import * as process from 'process';

import {readPackageJson, writePackageJson} from './utils/package-json';
import {copyFileSync} from './utils/copy-file';

/*
  prepare package.json for publishing

  deletes the scripts and devDependency property

  copy additional files: README.md, LICENSE, .npmignore
*/

const appname = path.basename(process.argv[1]);

let pkgJson = readPackageJson('package.json');
delete pkgJson.scripts;
delete pkgJson.devDependencies;
pkgJson = writePackageJson('dist/package.json', pkgJson);

copyFileSync('README.md', 'dist/README.md');
copyFileSync('LICENSE', 'dist/LICENSE');
copyFileSync('.npmignore', 'dist/.npmignore');

console.log(`prepare publishing for 'package.json' => ${pkgJson.name}@${pkgJson.version} succeed`);
