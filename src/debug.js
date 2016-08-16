const debug = require('debug');
const namespace = require('../package.json').name;

let _debug = debug(namespace);

_debug.log = debug(namespace + ':log');

_debug.error = debug(namespace + ':err');

module.exports = _debug;