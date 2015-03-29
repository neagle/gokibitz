var env = require('./environment.js');

exports.config = {
	seleniumAddress: env.seleniumAddress,

	framework: 'mocha',

	// The address of a running selenium server.
	seleniumAddress: 'http://localhost:4444/wd/hub',

	capabilities: env.capabilities,

	baseUrl: env.baseUrl,

	specs: ['*_spec.js'],

	mochaOpts: {
		enableTimeouts: false,
		reporter: 'spec',
		timeout: 4000
	}
};

