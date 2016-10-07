const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Promise = require('bluebird');
const debug = require('./debug');
const readdir = Promise.promisify(fs.readdir);
const breakpadPath = path.join(__dirname, '../mini-breakpad-server');


module.exports = { isInstalled, install, breakpadPath };

function isInstalled() {
	return readdir(path.join(breakpadPath, 'node_modules'))
		.then(files =>
			files.filter(file => file.indexOf('.') !== 0).length > 0
		)
		.catch(err => false);
}

function install() {
	return new Promise((res, rej) => {
		debug('npm installing of mini-breakpad-server');

		let install = spawn('npm', ['install', '--production'], {
			stdio: 'inherit',
			cwd: breakpadPath
		});

		install.on('data', data => {
			debug(data);
		});

		install.on('close', () => {
			debug('close npm install process');
			res();
		});

		install.on('error', err => {
			debug.error(err);
			rej(err);
		});
	});
}
