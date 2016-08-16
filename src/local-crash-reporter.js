const { crashReporter } = require('electron');
const crashServer = require('./server-runner');
const appPkg = require('./app-package');

crashReporter.start({
	companyName: 'Local Crash Reporter',
	productName: appPkg.productName || 'Local Crash Reporter',
	autoSubmit: true,
	submitURL: 'http://localhost:1127/post'
});

module.exports = crashServer;
