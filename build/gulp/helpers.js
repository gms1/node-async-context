'use strict';

const path = require('path');

function globify(...paths) {
  return path.join(...paths, '**', '*');
}


function updatePackageDependenciesVersions(deps, pkgPrefix, pkgVersion) {
  if (!deps) return;
  Object.getOwnPropertyNames(deps)
      .filter((name) => {return name.startsWith(`${pkgPrefix}/`)})
      .forEach((name) => {deps[name] = pkgVersion});
}

function updatePackageVersions(data, name, version) {
  data.version = version;

  const pkgNames = name.split('/');
  if (pkgNames.length>1) {
    const pkgPrefix = pkgNames[0];
    updatePackageDependenciesVersions(data.dependencies, pkgPrefix, version);
    updatePackageDependenciesVersions(data.devDependencies, pkgPrefix, version);
    updatePackageDependenciesVersions(data.peerDependencies, pkgPrefix, version);
  }
  return data;
}


module.exports.globify = globify;
module.exports.updatePackageVersions = updatePackageVersions;
