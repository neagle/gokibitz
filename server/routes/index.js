var express = require('express');
var router = express.Router();
//var path = require('path');
var auth = require('../config/auth');
//var markdown = require('markdown').markdown;
const Kifu = require('../models/kifu').Kifu;
const _ = require('lodash');

// User routes
var users = require('../controllers/users');
router.post('/auth/users', users.create);
router.put('/auth/users', users.update);
router.get('/auth/users/:userId', users.show);
// Admin-only password change
router.get('/auth/password-change/:username', users.externalPasswordChange);

// Reset password

// This schizophrenia regarding whether to use email or username shows my
// inconsistent thinking in implementing my first-ever password reset.
router.get('/auth/reset-password/:email', users.requestPasswordReset);
router.post('/auth/reset-password/:username', users.resetPassword);

// Check if username is available
// TODO: change underscore, bleah
router.get('/auth/check_username/:username', users.exists);

// Session Routes
var session = require('../controllers/session');
router.get('/auth/session', auth.ensureAuthenticated, session.session);
router.post('/auth/session', session.login);
router.delete('/auth/session', session.logout);

router.get('/embed/:id', function (req, res) {
	res.set('Content-Type', 'text/javascript');
	var file = '(function () {' +
		'"use strict";' +
		'var method = window.addEventListener ? "addEventListener" : "attachEvent";' +
		'var eventListener = window[method];' +
		'var eventMessage = method == "attachEvent" ? "onmessage" : "message";' +
		'eventListener(eventMessage, function (e) {' +
		'if (e.data === parseInt(e.data)) {' +
		'document.getElementById("gokibitz-' + req.params.id + '").height = e.data + "px";' +
		'}' +
		'}, false);' +
		'}());';
	res.send(file);
});

// Serve up partials for Angular routes
router.get('/partials/directives/:name', function (req, res) {
	res.render('partials/directives/' + req.params.name);
});

router.get('/partials/:name', function (req, res) {
	res.render('partials/' + req.params.name);
});

router.get('/', function (req, res) {
	if (req.user) {
		res.cookie('user', JSON.stringify(req.user.userInfo));
	}

	// Set Open Graph images
	let image = '';
	let shortId, path;
	if (req.originalUrl.substring(0, 6) === '/kifu/') {
		let pathString = req.originalUrl.substring(6).split('?path=');
		shortId = pathString[0];
		path = pathString[1] || '';
		image = `/api/kifu/image/${shortId}/${path}`;
	}

	if (shortId) {
		console.log('searching for shortId', shortId);
		Kifu
			.findOne({ shortid: shortId })
			.exec(function (error, kifu) {
				res.render('index', {
					og: {
						image: image,
						url: req.originalUrl
					},
					twitter: {
						card: 'summary_large_image',
						site: '@gokibitz',
						title: `GoKibitz: ${_.get(kifu, 'game.info.white.name', 'Anonymous')} vs. ${_.get(kifu, 'game.info.black.name',  'Anonymous')}`,
						description: `${_.get(kifu, 'game.info.place')} on ${_.get(kifu, 'game.info.date')}`,
						image: image,
						alt: 'An in-progress game of go'
					}
				});
			});
	} else {
		res.render('index');
	}

});


module.exports = router;
