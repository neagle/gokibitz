var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/user').User;
var Notification = require('../models/notification').Notification;
var _ = require('lodash');

// Get a user object from a username
function findUser(username, callback) {
	User.findOne({
		username: username
	}, function (error, user) {
		if (!error && user) {
			callback(null, user);
		} else if (error) {
			callback(error);
		} else {
			callback(null);
		}
	});
}

router.get('/', auth.ensureAuthenticated, function (req, res) {
	var offset = parseInt(req.query.offset, 10) || 0;
	var limit = Math.min(req.query.limit, 100) || 20;
	var username = req.query.username;
	var since = req.query.since || null;

	var unread;
	if (req.query.unread === 'false' || !req.query.unread) {
		unread = false;
	} else {
		unread = true;
	}

	// Turn the since param into a date object
	if (since) {
		since = new Date(since);
	}

	function getNotifications(error, user) {
		if (!error && user) {
			var notifications = Notification.find().where('to', user);

			if (unread) {
				notifications = notifications.where('read').equals(false);
			}

			if (since) {
				notifications = notifications.where('date').gt(since);
			}

			notifications
				.populate('from', 'username rank email gravatar')
				.populate('comment')
				.populate('kifu', '-comments')
				.sort('-date')
				.skip(offset)
				.limit(limit)
				.exec(function (error, notifications) {
					if (!error && notifications) {
						// Turn notifications into a JS object
						notifications = notifications.map(function (notification) {
							return notification.toObject();
						});

						// Strip the SGF. It was needed to resolve virtual info properties
						// But it adds unnecessary weight to the response
						notifications = _.map(notifications, function (notification) {
							delete notification.kifu.game.sgf;
							return notification;
						});
						res.json(200, notifications);
					} else if (!error) {
						res.json(200, []);
					} else {
						res.json(500, { message: error });
					}
				});
		} else if (error) {
			res.json(500, { message: error });
		} else {
			res.json(200, { message: [] });
		}
	}

	if (!username) {
		var user = req.user;
		getNotifications(null, user);
	} else {
		findUser(username, getNotifications);
	}
});

// Mark a notification as being read
router.get('/read/:id', auth.ensureAuthenticated, function (req, res) {
	var id = req.params.id;
	var user = req.user;

	Notification
		.findById(id)
		.populate('to')
		.exec(function (error, notification) {
			if (!error) {
				if (!user.equals(notification.to)) {
					res.json('550', { message: 'You can\'t read someone else\'s notification.' });
				} else {
					notification.read = true;
					notification.save(function (error) {
						if (!error) {
							res.json(200, {
								message: 'Notification marked as read.'
							});
						} else {
							res.json(500, { message: 'Could not mark notification as read. ' + error });
						}
					});
				}
			} else {
				res.json('500', { message: error });
			}
		});
});


module.exports = router;
