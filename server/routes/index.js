var express = require('express');
var router = express.Router();
//var path = require('path');
var auth = require('../config/auth');
//var markdown = require('markdown').markdown;

// User routes
var users = require('../controllers/users');
router.post('/auth/users', users.create);
router.get('/auth/users/:userId', users.show);

// Check if username is available
router.get('/auth/check_username/:username', users.exists);

// Session Routes
var session = require('../controllers/session');
router.get('/auth/session', auth.ensureAuthenticated, session.session);
router.post('/auth/session', session.login);
router.delete('/auth/session', session.logout);

// Serve up partials for Angular routes
router.get('/partials/:name', function (req, res) {
	res.render('partials/' + req.params.name);
});

router.get('/', function (req, res) {
	if (req.user) {
		res.cookie('user', JSON.stringify(req.user.userInfo));
	}

	res.render('index');
});


module.exports = router;
