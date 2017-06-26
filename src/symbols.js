const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const semver = require('semver');
const debug = require('./debug');
const rimraf = Promise.promisify(require('rimraf'));
const { appPkg, getElectronPkgVersion } = require('./app-package');

const pkgElectronVersion = getElectronPkgVersion(appPkg);
debug(`detected Electron version: ${pkgElectronVersion}`);
const downloadUrl = `https://github.com/electron/electron/releases/download/v${pkgElectronVersion}/electron-v${pkgElectronVersion}-${process.platform}-${process.arch}-symbols.zip`;
const poolPath = path.join(__dirname, '../mini-breakpad-server/pool');
const symbolsPath = path.join(poolPath, 'symbols');
const extractedFolderName = 'electron.breakpad.syms';

/**
 * Check if we have symbols for a version of Electron
 * @param {String} electronVersion
 * @returns {Boolean}
 */
async function hasSymbols(electronVersion = pkgElectronVersion) {
	try {
		await fs.statAsync(symbolsPath);
		let localVersion = await fs.readFileAsync(path.join(poolPath, 'version'), 'utf8');
		if(!pkgElectronVersion) {
			throw new Error(`Can't find electron version from package.json`);
		}
		// update our symbols if they're different from the package version
		if(semver.diff(localVersion, electronVersion)) {
			await rimraf(symbolsPath);
			return false;
		}
		else {
			return true;
		}
	} catch (err) {
		if(err.code !== 'ENOENT') {
			debug.error(err);
		}
		return false
	}	
}

async function extractZip(zipPath) {
	debug('extracting symbols to ', poolPath);
	const ADMZip = require('adm-zip'); //lazy load this

	let zip = new ADMZip(zipPath);
	zip.extractAllTo(poolPath, true);
	debug('extraction complete');

	await fs.renameAsync(path.join(poolPath, extractedFolderName), symbolsPath);
	debug('symbols folder moved to ', path.join(poolPath, 'symbols'));

	await fs.unlinkAsync(zipPath);
	debug('temp zip deleted, ', zipPath);
}

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
