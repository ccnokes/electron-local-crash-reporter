const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const syms = require('./symbols');
const debug = require('./debug');
const breakpadModules = require('./breakpad-modules');

let proc = null;


module.exports = { start, close };


function start() {
  //the npm hosted version of mini-breakpad-server doesn't work and it has native modules, so we have to run install on it
  //we don't have to wait for the symbols to be done downloading to start the server
  let installPromise = breakpadModules.isInstalled()
    .then(isInstalled => !isInstalled ? breakpadModules.install() : true)
    .then(startServer);

  //if we don't have any symbols, download them and extract them to the right dir for mini-breakpad-server
  //this also ensures the symbols we have are up to date
  let symsPromise = syms.hasSymbols()
    .then(haz => !haz ? syms.download() : true);

  return Promise.all([installPromise, symsPromise])
    .catch(debug.error);
}

function startServer() {
  debug('starting server');

  // run the breakpad server in it's own node.js process
  // direct it's stdio to the electron parent processes'
  proc = fork(path.join(__dirname, './breakpad-wrapper.js'), {
    stdio: 'inherit',
    cwd: './',
    env: { parentPID: process.pid }
  });

  proc.on('close', code => {
    debug('closing breakpad server');
  });

  proc.on('error', (err, signal) => {
    debug.error(err, signal);
  });
}

function close() {
  proc && proc.kill();
}
