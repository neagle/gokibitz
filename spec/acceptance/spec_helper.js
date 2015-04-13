var mocha = require('mocha'),
		chai = require('chai'),
		chaiAsPromised = require('chai-as-promised'),
		nodemon = require('nodemon'),
		expect = chai.expect,
		env = require('./environment'),
		child_process = require('child_process'),
		fs = require('fs'),
		app = require('../../server'),
		debug = require('debug')('gokibitz'),
		io = require('../../server/io'),
		server;

chai.use(chaiAsPromised);
global.expect = expect;

app.set('port', 3435); // Use a different port from development server

before(function() {
	server = app.listen(app.get('port'), function() {
		debug('Express server listening on port ' + server.address().port);
	});
	browser.baseUrl = 'http://localhost:'+ server.address().port;
});

after(function(){
	server.close();
});
