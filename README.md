# electron-local-crash-reporter

The goal of this module is to simplify running `mini-breakpad-server` in local development. Basically, it makes Electron's `crashReporter` API work easily out of the box for you, so you don't have to bother running mini-breakpad-server in a separate terminal window, download the symbols and move them to the right folder, etc.

Add this module as a dev dependency and only run it in local development, and it will:

- Manage starting/stopping the breakpad server automatically
- Download the correct Electron symbols (and seamlessly update them when you change Electron versions)
- Minimal impact on app start time

This module is helpful if you do not have a remote crash report server running yet, or do not want to send crash reports created in local development to it.

## Install
```
npm install --save-dev electron-local-crash-reporter
```

## Example
All you really do is `require('electron-local-crash-reporter').start();`, but here's a fuller example:

```javascript
// this is your main process
const { app, BrowserWindow } = require('electron');
let mainWindow = null;

// only run it in local development (check for this however you like)
if(process.execPath.indexOf('electron') > -1) {
  // it handles shutting itself down automatically
  require('electron-local-crash-reporter').start();
}

app.on('ready', function() {
  mainWindow = new BrowserWindow({ /* ... */ });
});

```
