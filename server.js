var express = require('express');
var compression = require('compression');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var configDB = require('./server/config/database.js');

var http = require('http');
var httpProxy = require('http-proxy');

var app = express();

mongoose.connect(configDB.url);

// Compress all requests
app.use(compression());

// Bootstrap models
var modelsPath = path.join(__dirname, 'server/models');
fs.readdirSync(modelsPath).forEach(function (file) {
	require(modelsPath + '/' + file);
});

require('./server/config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/client/public/images/favicons/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/public')));

// express/mongo session storage
app.use(session({
	secret: 'thelanguageofhands',
	store: new mongoStore({
		url: configDB.url,
		collection: 'sessions'
	}),
	resave: false,
	saveUninitialized: true
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

var routes = require('./server/routes/index');
var user = require('./server/routes/user');
var kifu = require('./server/routes/kifu');
var comment = require('./server/routes/comment');
var markdown = require('./server/routes/markdown');
var notification = require('./server/routes/notification');
var settings = require('./server/routes/settings');

app.use('/', routes);
app.use('/api/user/', user);
app.use('/api/kifu/', kifu);
app.use('/api/comment/', comment);
app.use('/api/markdown/', markdown);
app.use('/api/notification/', notification);
app.use('/api/settings/', settings);
app.use('*', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

// Let's fix our memory leak¬
var memwatch = require('memwatch-next');
var heapdump = require('heapdump');

memwatch.on('leak', function (info) {
	console.error('Memory leak detected:', info);
	var file = '/tmp/gokibitz-' + process.pid + '-' + Date.now() + '.heapsnapshot';
	heapdump.writeSnapshot(file, function (err) {
		if (err) {
			console.error(err);
		} else {
			console.error('Wrote snapshot: ' + file);
		}
	});
});

module.exports = app;
