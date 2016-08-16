const fs = require('fs');
const path = require('path');
const request = require('request');
const semver = require('semver');
const rimraf = require('rimraf');
const ADMZip = require('adm-zip');
const debug = require('./debug');

const appPkg = require('./app-package');
const electronPkg = (appPkg.devDependencies['electron-prebuilt'] || appPkg.devDependencies['electron-prebuilt-compile']);
const version = electronPkg.replace(/\^|~|v/g, '');
const url = `https://github.com/electron/electron/releases/download/v${version}/electron-v${version}-${process.platform}-${process.arch}-symbols.zip`;

const poolPath = path.join(__dirname, '../mini-breakpad-server/pool');
const symbolsPath = path.join(poolPath, 'symbols');
const extractedFolderName = 'electron.breakpad.syms';


module.exports = { hasSymbols, download };


function hasSymbols() {
	try {
		let exists = fs.existsSync(symbolsPath);
		if(exists) {
			let contents = fs.readFileSync(path.join(poolPath, 'version'), 'utf8');
			// update our symbols if they're different from the package version
			if(semver.diff(contents, version)) {
				rimraf.sync(symbolsPath);
				return false;
			}
		}
		return exists;
	} catch(e) {
		console.error(e);
		return false;
	}
}

function download() {
	const zipPath = path.join(__dirname, 'syms.zip');
	debug('download symbols zip file from: ', url);

	request.get(url)
		.pipe(fs.createWriteStream(zipPath)
		.on('error', err => debug.err(err))
		.on('close', () => {
			debug('extracting symbols to ', poolPath);
			let zip = new ADMZip(zipPath);
			zip.extractAllTo(poolPath, true);
			debug('extraction complete');

			fs.renameSync(path.join(poolPath, extractedFolderName), symbolsPath);
			debug('symbols folder moved to ', path.join(poolPath, 'symbols'));

			fs.unlinkSync(zipPath);
			debug('temp zip deleted, ', zipPath);
		}));
}
