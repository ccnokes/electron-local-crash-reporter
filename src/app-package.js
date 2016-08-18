const path = require('path');

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
const pkgPath = path.join(parentDir, 'package.json');
const pkg = require(pkgPath);

module.exports = pkg;
