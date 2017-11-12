const sorcery = require('sorcery');

build_sorcery = function(file, optLoad, optWrite) {
  if (!file) {
    throw new Error(`build_sorcery: 'file' is not defined`);
  }
  return sorcery.load(file, optLoad)
      .then(function(chain) {
        if (chain) {
          return chain.write(optWrite);
        }
        throw new Error(`failed to load`);
      })
      .catch((e) => { console.log(`build_sorcery: '${file}': ${e}`); });
};
build_sorcery_sync = function(file, optLoad, optWrite) {
  var chain = sorcery.loadSync(file, optLoad);
  if (chain) {
    chain.writeSync();
    return;
  }
  throw new Error(`failed to load`);
};
module.exports.build_sorcery = build_sorcery;
module.exports.build_sorcery_sync = build_sorcery_sync;
