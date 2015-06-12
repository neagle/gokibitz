'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
//var passport = require('passport');
var ObjectId = mongoose.Types.ObjectId;

/**
 * Create user
 * requires: {username, password, email}
 * returns: {email, password}
 */
exports.create = function (req, res, next) {
	var newUser = new User(req.body);
	newUser.provider = 'local';

	newUser.save(function (err) {
		if (err) {
			return res.json(400, err);
		}

		req.logIn(newUser, function (err) {
			if (err) {
				return next(err);
			}
			return res.json(newUser.userInfo);
		});
	});
};

/**
 *  Show profile
 *  returns {username, profile}
 */
exports.show = function (req, res, next) {
	var userId = req.params.userId;

	User.findById(new ObjectId(userId), function (err, user) {
		if (err) {
			return next(new Error('Failed to load User'));
		}
		if (user) {
			res.send({username: user.username, profile: user.profile });
		} else {
			res.send(404, 'USER_NOT_FOUND');
		}
	});
};

/**
 *  Update user
 *  returns {username, profile}
 */
exports.update = function (req, res, next) {
	User.findById(req.user._id, function (err, user) {
		if (err) {
			return next(new Error('Failed to load User'));
		}
		if (user) {
			if (user.authenticate(req.body.oldPassword)) {
				user.password = req.body.newPassword;
				user.save(function (error) {
					if (error) {
						res.json(500, error);
					} else {
						res.send(200, 'Password successfully changed');
					}
				});
			} else {
				res.json(500, 'Old password is not correct');
			}
		} else {
			res.send(404, 'USER_NOT_FOUND');
		}
	});


	//User.findById(new ObjectId(userId), function (err, user) {
		//if (err) {
			//return next(new Error('Failed to load User'));
		//}
		//if (user) {
			//console.log('user', user);
			//console.log('req.body', req.body);
			////user.password = req.body.password
			//res.send({username: user.username, profile: user.profile });
		//} else {
			//res.send(404, 'USER_NOT_FOUND');
		//}
	//});
};

/**
 *  Username exists
 *  returns {exists}
 */
exports.exists = function (req, res, next) {
	var username = req.params.username;
	User.findOne({ username : username }, function (err, user) {
		if (err) {
			return next(new Error('Failed to load User ' + username));
		}

		if (user) {
			res.json({exists: true});
		} else {
			res.json({exists: false});
		}
	});
};
