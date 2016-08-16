const path = require('path');
const fs = require('fs');
const { fork, spawn } = require('child_process');
const syms = require('./symbols');
const debug = require('./debug');
const breakpadPath = path.join(__dirname, '../mini-breakpad-server');
let proc = null;

module.exports = { start, close };

function isNPMInstalled() {
  try {
    return fs.readdirSync(path.join(breakpadPath, 'node_modules'))
        .filter(file => file.indexOf('.') !== 0)
        .length > 0;
  } catch(err) {
    return false;
  }
}

function npmInstall() {
  let install = spawn('npm', ['install', '--production'], {
    stdio: 'inherit',
    cwd: breakpadPath
  });

  install.on('data', data => {
    console.log(data);
  });

  install.on('close', () => {
    debug('close npm install process');
  });

  install.on('error', err => {
    debug.error(err);
  });

  return install;
}

function start() {
  debug('starting server');

  if(!isNPMInstalled()) {
    debug('installing deps');
    npmInstall();
  }

  //if we don't have any symbols, download them and extract them to the right dir for mini-breakpad-server
  //this also ensures the symbols we have are up to date
  if(!syms.hasSymbols()) {
    syms.download();
  }

  // run the breakpad server in it's own node.js process
  // direct it's stdio to the electron parent processes'
  proc = fork('./lib/app.js', {
    stdio: 'inherit',
    cwd: breakpadPath
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

// kill the child_process on parent process exit
process.on('exit', () => {
  close();
});
