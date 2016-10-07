const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const semver = require('semver');
const rimraf = require('rimraf');
const debug = require('./debug');

const rimrafAsync = Promise.promisify(rimraf);

const appPkg = require('./app-package');
const pkgElectronVersion = getElectronPackageName().replace(/\^|~|v/g, '');
const downloadUrl = `https://github.com/electron/electron/releases/download/v${pkgElectronVersion}/electron-v${pkgElectronVersion}-${process.platform}-${process.arch}-symbols.zip`;

const poolPath = path.join(__dirname, '../mini-breakpad-server/pool');
const symbolsPath = path.join(poolPath, 'symbols');
const extractedFolderName = 'electron.breakpad.syms';


function getElectronPackageName() {
	const devDeps = appPkg.devDependencies;
	return devDeps['electron-prebuilt'] ||
		devDeps['electron-prebuilt'] ||
		devDeps['electron-prebuilt-compile'];
}

const hasSymbols = Promise.coroutine(function* () {
	try {
		yield fs.statAsync(symbolsPath);
		let localVersion = yield fs.readFileAsync(path.join(poolPath, 'version'), 'utf8');
		// update our symbols if they're different from the package version
		if(semver.diff(localVersion, pkgElectronVersion)) {
			yield rimrafAsync(symbolsPath);
			return false;
		}
		else {
			return true;
		}
	} catch(err) {
		if(err.code !== 'ENOENT') {
			debug.error(err);
		}
		return false
	}
});

const extractZip = Promise.coroutine(function* (zipPath) {
	debug('extracting symbols to ', poolPath);
	const ADMZip = require('adm-zip'); //lazy load this

	let zip = new ADMZip(zipPath);
	zip.extractAllTo(poolPath, true);
	debug('extraction complete');

	yield fs.renameAsync(path.join(poolPath, extractedFolderName), symbolsPath);
	debug('symbols folder moved to ', path.join(poolPath, 'symbols'));

	yield fs.unlinkAsync(zipPath);
	debug('temp zip deleted, ', zipPath);
});

function download() {
	return new Promise((res, rej) => {
		const zipPath = path.join(__dirname, 'syms.zip');
		debug('download symbols zip file from: ', downloadUrl);
		const request = require('request'); //lazy load this

		request.get(downloadUrl)
			.pipe(fs.createWriteStream(zipPath)
				.on('error', err => {
					debug.err(err);
					rej(err);
				})
				.on('close', () => {
					extractZip(zipPath).then(res);
				}));
	});
}


module.exports = { hasSymbols, download };
