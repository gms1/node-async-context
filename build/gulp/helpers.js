'use strict';

const path = require('path');

// -----------------------------------------------------------------------
function globify(...paths) {
  return path.join(...paths, '**', '*');
}


// -----------------------------------------------------------------------
function updatePackageVersions(data, name, version) {
  data.version = version;

  const pkgNames = name.split('/');
  if (pkgNames.length>1) {
    const pkgPrefix = pkgNames[0];
    updatePackageDependenciesVersions(data.dependencies, pkgPrefix, name, version);
    updatePackageDependenciesVersions(data.devDependencies, pkgPrefix, name, version);
    updatePackageDependenciesVersions(data.peerDependencies, pkgPrefix, name, version);
  } else {
    updatePackageDependenciesVersions(data.dependencies, undefined, name, version);
    updatePackageDependenciesVersions(data.devDependencies, undefined, name, version);
    updatePackageDependenciesVersions(data.peerDependencies, undefined, name, version);
  }
  return data;
}


function updatePackageDependenciesVersions(deps, pkgPrefix, pkgName, pkgVersion) {
  if (!deps) return;
  if (deps[pkgName]) {
    deps[pkgName] = pkgVersion;
  }
  if (!pkgPrefix) return;
  Object.getOwnPropertyNames(deps)
    .filter((name) => {return name.startsWith(`${pkgPrefix}/`)})
    .forEach((name) => {deps[name] = pkgVersion});
}

// -----------------------------------------------------------------------
function moveDependencies(data, propFrom, propTo) {
  if (data[propFrom]) {
    if (!data[propTo]) {
      data[propTo] = {};
    }
    Object.keys(data[propFrom]).forEach((key) => {
      data[propTo][key] = data[propFrom][key];
    });
    delete data[propFrom];
  }
}


// -----------------------------------------------------------------------

module.exports.globify = globify;
module.exports.updatePackageVersions = updatePackageVersions;
module.exports.moveDependencies = moveDependencies;
