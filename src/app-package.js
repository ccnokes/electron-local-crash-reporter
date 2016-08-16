const path = require('path');
const pkgUp = require('pkg-up');

//traverse up module tree till we find the root JS file
function getBaseParent(module) {
	if(module.parent && module.filename && module.filename.indexOf('node_modules') === -1) {
		return getBaseParent(module.parent);
	}
	else {
		return (module.children[0] || module);
	}
}

const parentDir = path.dirname(getBaseParent(module).filename);
const pkgPath = pkgUp.sync(parentDir);

module.exports = require(pkgPath);
