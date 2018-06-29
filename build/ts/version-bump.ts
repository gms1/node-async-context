import * as path from 'path';
import * as process from 'process';
import {readPackageJson, writePackageJson} from './utils/package-json';

/*
  bumps the package version
  usage: pathToPkgJson newVersion
*/

const appname = path.basename(process.argv[1]);

if (process.argv.length !== 4) {
  console.error(`${appname}: ERROR: usage ts-node ${appname} pathToPkgJson newVersion`);
  process.exit(1);
}

let pkgJson = readPackageJson(process.argv[2]);
pkgJson.version = process.argv[3];
pkgJson = writePackageJson(process.argv[2], pkgJson);
console.log(`bump version ${process.argv[2]} => ${pkgJson.name}@${pkgJson.version} succeed`);
