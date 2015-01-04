var express = require('express');
var compression = require('compression');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var configDB = require('./server/config/database.js');

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

app.use(favicon());
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
	})
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

var routes = require('./server/routes/index');
var user = require('./server/routes/user');
var kifu = require('./server/routes/kifu');
var comment = require('./server/routes/comment');
var markdown = require('./server/routes/markdown');
app.use('/', routes);
app.use('/api/user/', user);
app.use('/api/kifu/', kifu);
app.use('/api/comment/', comment);
app.use('/api/markdown/', markdown);
app.use('*', routes);

/// catch 404 and forward to error handler
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


module.exports = app;
