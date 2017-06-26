const path = require('path');
const fs = require('fs');

function getBaseParent(dir = path.dirname(require.main.filename)) {
	if(dir.indexOf('node_modules') > -1) {
		return getBaseParent(path.join(dir, '../'));
	}
	else {
		const pkgPath = path.join(dir, 'package.json');
		try {
			const pkg = require(pkgPath);
			if(!getElectronPkgVersion(pkg)) {
				throw new Error('Could not find electron version in this package.json, trying up a level.');
			}
			else {
				return pkg;
			}
		}
		catch(error) {
			return getBaseParent(path.join(dir, '../'));
		}
	}
}

function getElectronPkgVersion(pkg) {
	return pkg.devDependencies.electron.replace(/\^|~|v/g, '');
}

module.exports = {
	appPkg: getBaseParent(),
	getBaseParent,
	getElectronPkgVersion
};
