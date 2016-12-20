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
						res.send(500, error);
					} else {
						res.send(200, 'Password successfully changed');
					}
				});
			} else {
				res.send(500, 'Old password is not correct');
			}
		} else {
			res.send(404, 'USER_NOT_FOUND');
		}
	});

};

// An admin-only way of changing user passwords
exports.externalPasswordChange = function (req, res, next) {
	// res.send(200, 'We are making progress, ' + req.user.admin);
	if (!req.user.admin) {
		res.send(403, 'This is an admin-only feature');
	}

	if (req.params.username) {
		User.findOne({ username: req.params.username }, function (err, user) {
			if (err) {
				return next(new Error('Failed to load User'));
			}
			if (user) {

				if (!req.query.newPassword) {
					res.send(500, 'Please provide a new password');
				} else {
					user.password = req.query.newPassword;
					user.save(function (error) {
						if (error) {
							res.send(500, error);
						} else {
							res.send(200, 'Password successfully changed');
						}
					});
				}
			} else {
				res.send(404, 'USER_NOT_FOUND');
			}
		});
	} else {
		res.send(500, 'Please provide a username');
	}
};

exports.requestPasswordReset = function (req, res, next) {
	User.findOne({ username: req.params.username })
		.exec(function (err, user) {
			if (err) {
				res.send(500, err);
			} else {
				if (user) {
					user.resetPassword();
					user.save(function (error) {
						if (error) {
							res.send(500, error);
						} else {
							res.send(200, 'Reset password token set. It expires in 24 hours.');
						}
					});
				} else {
					res.send(404, 'USER_NOT_FOUND');
				}
			}
		});
};

exports.resetPassword = function (req, res, next) {
	User.findOne({ username: req.params.username })
		.exec(function (err, user) {
			if (err) {
				res.send(500, err);
			} else {
				if (user) {
					if (req.body.token === user.reset.token) {
						if (Date.now() < +new Date(user.reset.expires)) {
							if (req.body.newPassword) {
								user.password = req.body.newPassword;
								user.reset.token = null;
								user.reset.expires = null;
								user.save(function (error) {
									if (error) {
										res.send(500, error);
									} else {
										res.send(200, 'Password successfully changed');
									}
								});
							} else {
								res.send(500, 'Please provide a new password');
							}
						} else {
							res.send(500, 'Reset token has expired');
						}
					} else {
						res.send(500, 'Invalid token');
					}
				} else {
					res.send(404, 'USER_NOT_FOUND');
				}
			}
		});
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
