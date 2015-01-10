var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Notification = require('../models/notification').Notification;
var Comment = require('../models/comment').Comment;

router.post('/', auth.ensureAuthenticated, function (req, res) {
	Kifu.findOne({
		_id: req.body._id
	}, function (error, kifu) {
		if (!error && kifu) {

			var comment = new Comment();

			comment.kifu = kifu;
			comment.user = req.user;
			comment.path = req.body.path;
			comment.content.markdown = req.body.content;

			comment.save(function (error) {
				if (!error) {
					kifu.comments.push(comment);
					kifu.save(function (error) {
						if (!error) {
							res.json(201, { message: 'Comment created with id: ' + comment._id });

							// Send notifications
							comment.getRecipients(function (recipients) {
								console.log('recipients', recipients);
								recipients.forEach(function (recipient) {
									// Send a notification to the kifu owner
									var notification = new Notification();
									notification.to = recipient;
									notification.from = comment.user;
									notification.kifu = comment.kifu;
									notification.path = comment.path;
									notification.comment = comment._id;

									notification.save();
								});
							});

						} else {
							res.json(500, {
								message: 'Error pushing reference to parent kifu. Error: ' + error
							});
						}
					});
				} else {
					res.json(500, { message: 'Error saving comment. Error: ' + error });
				}
			});

		} else if (error) {
			res.json(500, { message: 'Error creating comment. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for _id:' + req.params._id });
		}
	});
});

// Get a list of comments in reverse cron
router.get('/', function (req, res) {
	var offset = req.query.offset || 0;
	var limit = Math.min(req.query.limit, 100) || 20;
	var username = req.query.username || '';
	var since = req.query.since || null;

	// Turn the since param into a date object
	if (since) {
		since = new Date(since);
	}

	var comments = Comment.find()
		.sort('-date')
		.skip(offset)
		.limit(limit);

	if (since) {
		comments = comments.where('date').gt(since);
	}

	if (username) {
		User.findOne({ username: username })
			.exec(function (error, user) {
				if (!error && user) {
          comments
            .where('user').equals(user._id)
            .populate('user', 'username email gravatar rank')
            .populate('kifu', 'shortid game')
						.select('-kifu.game')
            .exec(function (error, comments) {
              if (!error) {
                res.json('200', comments);
              } else {
                res.json('500', { message: error });
              }
            });
        } else {
					if (error) {
						res.json('500', { message: error });
					} else if (!user) {
						res.json('500', { message: 'That username does not exist.' });
					}
				}
			});
	} else {
		comments
			.populate('user', 'username email gravatar rank')
			.populate('kifu', 'shortid game')
			.exec(function (error, comments) {
				if (!error) {
					res.json('200', comments);
				}	 else {
					res.json('500', { message: error });
				}
			});
	}
});

router.get('/:id', function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error) {
				res.json('200', comment);
			} else {
				res.json('500', { message: error });
			}
		});
});

router.delete('/:id', auth.ensureAuthenticated, function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		// TODO: The fact that the isOwner method relies on this external populate
		// method is bad, bad, bad. How do we deal with this?
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {

			if (!error && comment) {
				if (!comment.isOwner(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t delete another user\'s comment.' });
				} else {
					// Delete the reference to the comment in the parent kifu
					Kifu.findOne({
						_id: comment.kifu
					}, function (error, kifu) {
						var comments = kifu.comments;
						var index = comments.indexOf(id);
						comments.splice(index, 1);
						kifu.save();
					});
					comment.remove();
					res.json(200, { message: 'Comment removed.' });

					// Remove any notifications for this comment
					Notification.find()
						.where('comment', comment)
						.exec(function (error, notifications) {
							if (!error) {
								for (var i = notifications.length - 1; i >= 0; i -= 1) {
									notifications[i].remove();
								}
							} else {
								console.log('Could not delete notifications for this comment', error);
							}
						});
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not delete comment. ' + error });
			}
		});
});

router.put('/:id', auth.ensureAuthenticated, function (req, res) {
	var id = req.params.id;
	var markdown = req.body.content.markdown;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error && comment) {
				if (!comment.isOwner(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t edit another user\'s comment.' });
				} else {
					comment.content.markdown = markdown;
					comment.save(function (error) {
						if (!error) {
							res.json(200, {
								message: 'Comment updated.',
								comment: comment
							});
						} else {
							res.json(500, { message: 'Could not update comment. ' + error });
						}
					});
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not update comment. ' + error});
			}
		});
});

module.exports = router;
