const { crashReporter } = require('electron');
const crashServer = require('./server-runner');
const appPkg = require('./app-package');

function start() {
	crashReporter.start({
		companyName: 'Local Crash Reporter',
		productName: appPkg.productName || 'Local Crash Reporter',
		autoSubmit: true,
		submitURL: 'http://localhost:1127/post'
	});

	crashServer.start();
}

// kill the child_process on parent process exit
process.on('exit', () => {
	crashServer.close();
});

module.exports = { start, close: crashServer.close };
