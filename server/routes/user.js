var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/user').User;
var Kifu = require('../models/kifu').Kifu;
var _ = require('lodash');

// Get a list of users
router.get('/list', auth.ensureAuthenticated, function (req, res) {
	var limit = req.query.limit || 5;
	var caseSensitive = (typeof req.query.caseSensitive === 'undefined') ? false : req.query.caseSensitive;
	var regex;

	if (caseSensitive) {
		regex = new RegExp('^' + req.query.search);
	} else {
		regex = new RegExp('^' + req.query.search, 'i');
	}

	User.find({ username: regex })
		.limit(limit)
		.select('-hashedPassword -salt')
		.exec(function (error, users) {
			if (!error && users) {
				var usersObj = users.map(function (user) {
					return user.toObject();
				});

				res.json(200, usersObj);
			} else if (error) {
				res.json(500, { message: 'Error finding users for search term: ' + req.query.search + error });
			} else {
				res.json(404, { message: 'No users with that search term found.' });
			}
		});
});

// Get a user
router.get('/:username', function (req, res) {
	User.findOne({ username: req.params.username })
		.select('-hashedPassword -salt')
		.exec(function (error, user) {
			if (!error && user) {
				// Get a user's total star count
				// TODO: this is just one of probably a handful of things we're going
				// to want to get about a user that require async operations. This will
				// probably need to be abstracted into a unified function.
				user.getStars(function (error, stars) {
					user = user.toObject();
					user.stars = stars;
					res.json(200, user);
				});
			} else if (error) {
				res.json(500, { message: 'Error finding user. ' + error });
			} else {
				res.json(404, { message: 'No user with that username found.' });
			}
		});
});

// Update a user's information
router.put('/:username', auth.ensureAuthenticated, function (req, res) {
	User.findOne({ username: req.params.username })
		.exec(function (error, user) {
			if (!error && user) {
				if (!user.equals(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t edit another user\'s information.' });
				} else {
					user.update(req.body, {}, function (error, numberAffected, rawResponse) {
						if (!error) {
							res.json(200, {
								message: 'User updated.',
								user: _.assign(user, req.body)
							});
						} else {
							res.json(500, { message: 'Could not update user. ' + error });
						}
					});
				}
			} else if (error) {
				res.json(500, { message: 'Error finding user. ' + error });
			} else {
				res.json(404, { message: 'No user with that username found.' });
			}
		});
});

// Get a user's kifu
router.get('/:user/kifu', function (req, res) {
	var offset = req.query.offset || 0;
	var limit = Math.min(req.query.limit, 100) || 20;
	var search = req.query.search || '';

	function findUser(username) {
		User.findOne({
			username: username
		}, function (error, user) {
			if (!error && user) {
				listKifu(user);
			} else if (error) {
				res.json(500, { message: 'Error finding user. ' + error });
			} else {
				res.json(404, { message: 'No user with that username found.' });
			}
		});
	}

	function listKifu(user) {
		// Get the total count of kifu
		var criteria = {
			owner: user,
			deleted: false
		};

		if (search) {
			search = new RegExp(search, 'gi');
			criteria['game.sgf'] = search;
		}

		Kifu.count(criteria, function (error, count) {
			var userKifu = Kifu
				.where('owner', user)
				.where('deleted').equals(false);

			if (search) {
				userKifu = userKifu
					.where('game.sgf').equals(search);
			}

			userKifu
				.sort({ uploaded: -1 })
				.skip(offset)
				.limit(limit)
				.exec(function (error, kifu) {
					if (!error && kifu.length) {
						res.json(200, {
							kifu: kifu,
							total: count
						});
					} else if (error) {
						res.json(500, { message: 'Error loading kifu. ' + error });
					} else {
						res.json(404, { message: 'No kifu found.' });
					}
				});
		});
	}

	findUser(req.params.user);
});

module.exports = router;
