import * as fs from 'fs';

const indent = 2;

// ======================================================================================
export function readPackageJson(path: string): any {
  const buf = fs.readFileSync(path, 'utf8');
  return JSON.parse(buf);
}

// ======================================================================================
export function writePackageJson(path: string, pkgJson: any): any {
  const tmpJsonPath = path + '.tmp';
  const pkgText = JSON.stringify(pkgJson, undefined, indent) + '\n';
  fs.writeFileSync(tmpJsonPath, pkgText);
  fs.renameSync(tmpJsonPath, path);
  return pkgJson;
}

// ======================================================================================
export function getPackageDependencies(pkgJson: any): Map<string, string> {
  const res = new Map<string, string>();

  if (pkgJson.optionalDependencies) {
    Object.keys(pkgJson.optionalDependencies).forEach((depName) => {
      res.set(depName, pkgJson.optionalDependencies[depName]);
    });
  }
  if (pkgJson.peerDependencies) {
    Object.keys(pkgJson.peerDependencies).forEach((depName) => {
      res.set(depName, pkgJson.peerDependencies[depName]);
    });
  }
  if (pkgJson.devDependencies) {
    Object.keys(pkgJson.devDependencies).forEach((depName) => {
      res.set(depName, pkgJson.devDependencies[depName]);
    });
  }
  if (pkgJson.dependencies) {
    Object.keys(pkgJson.dependencies).forEach((depName) => {
      res.set(depName, pkgJson.dependencies[depName]);
    });
  }
  return res;
}
