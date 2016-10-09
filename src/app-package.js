const path = require('path');
const fs = require('fs');

function getBaseParent(dir = require.main.filename) {
	if(dir.indexOf('node_modules') > -1) {
		return getBaseParent(path.join(dir, '../'));
	}
	else {
		const pkgPath = path.join(dir, 'package.json');
		try {
			return require(pkgPath);
		}
		catch(error) {
			return getBaseParent(path.join(dir, '../'));
		}
	}
}

module.exports = getBaseParent();
