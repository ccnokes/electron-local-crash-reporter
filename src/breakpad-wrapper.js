const path = require('path');
const isRunning = require('./is-running');
const { breakpadPath } = require('./breakpad-modules');
const parentPID = +process.env.parentPID;

// poll the parent process to make sure it's still alive
// there seems to be no better way to do this
setInterval(() => {
  if(!isRunning(parentPID)) {
    process.exit(0);
  }
}, 3000);

process.chdir(breakpadPath);

// start mini-breakpad-server
require(path.join(process.cwd(), './lib/app.js'));
