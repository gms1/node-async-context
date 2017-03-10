'use strict';

const path = require('path');

function globify(...paths) {
  return path.join(...paths, '**', '*');
}
module.exports.globify = globify;



