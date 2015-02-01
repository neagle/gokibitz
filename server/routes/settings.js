var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/user').User;
var _ = require('lodash');

router.get('/', auth.ensureAuthenticated, function (req, res) {
	if (req.user) {

		var settings = {};

		// If specific keys are sent, send back only those values
		if (req.query.keys && req.user.settings) {
			var keys = req.query.keys;
			if (Array.isArray(keys)) {
				req.query.keys.forEach(function (key) {
					if (req.user.settings[key]) {
						settings[key] = req.user.settings[key];
					}
				});
			} else {
				// Only one key requested
				settings[keys] = req.user.settings[keys];
			}
		} else {
			settings = req.user.settings || {};
		}

		res.json(200, settings);
	} else {
		res.json(404, { message: 'You don\'t appear to be logged in.' });
	}
});

// Using put to update a user's sub-resource
// @see http://stackoverflow.com/a/2208375/399077
router.put('/', auth.ensureAuthenticated, function (req, res) {
	if (!req.user) {
		res.json(404, { message: 'You don\'t appear to be logged in.' });
	}

	if (!Object.keys(req.body).length) {
		// 204 - no content
		res.send(204);
	} else {
		User.findOne({ username: req.user.username })
			.select('settings')
			.exec(function (error, user) {
				if (!error && user) {
					user.settings = user.settings || {};
					_.assign(user.settings, req.body);

					// Remove empty values, but not falsy ones (we want to allow negative
					// values like false or 0)
					for (var key in user.settings) {
						if (user.settings[key] === '') {
							delete user.settings[key];
						}
					}

					user.markModified('settings');
					user.save();

					res.json(200, user.settings);
				} else if (error) {
					res.json(500, { message: 'Error finding user. ' + error });
				} else {
					res.json(404, { message: 'No user with that username found.' });
				}
			});
	}
});

module.exports = router;
