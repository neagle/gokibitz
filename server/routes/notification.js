var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/user').User;
var Notification = require('../models/notification').Notification;

function findUser(username, callback) {
	User.findOne({
		username: username
	}, function (error, user) {
		if (!error && user) {
			callback(user);
		} else if (error) {
			return error;
		} else {
			return null;
		}
	});
}

router.get('/:user', auth.ensureAuthenticated, function (req, res) {
	var username = req.params.user;

	findUser(username, function (user) {
		Notification.find()
			.where('to', user)
			.populate('comment')
			.sort('-date')
			.exec(function (error, notifications) {
				if (!error && notifications) {
					res.json(200, notifications);
				} else if (!error) {
					res.json(200, []);
				} else {
					res.json(500, { message: error });
				}
			});
	});

});

module.exports = router;
