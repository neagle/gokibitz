var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Notification = require('../models/notification').Notification;
var Comment = require('../models/comment').Comment;
var async = require('async');
var io = require('../io');
var _ = require('lodash');
var notificationHelper = require('../utils/notificationHelper');

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

					// TODO: There's gotta be an easier way deal with a schema change than this.
					// Originals were added after some games had already been uploaded,
					// so if we find an older game without one, we just make one from the
					// current state of the sgf.
					if (!kifu.game.original) {
						kifu.game.original = kifu.game.sgf;
					}

					kifu.save(function (error) {
						if (!error) {
							res.json(201, { message: 'Comment created with id: ' + comment._id });

							// Send notifications
							comment.getRecipients(function (recipients) {
								recipients.forEach(function (recipient) {
									notificationHelper.newNotification(comment, 'new comment', recipient);
								});
							});

							notificationHelper.notifyMentionedUsers(comment);

							comment.populate('user', function () {
								io.emit('send:' + kifu._id, {
									change: 'new',
									comment: comment
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
	var user;
	var username = req.query.username || '';
	var since = req.query.since || null;

	// Bundle successive comments by the same user about the same kifu into a
	// single comment with an array of paths (moves)
	//
	// Helpful for preventing bursts of activity from wiping out everything else
	// that's interesting from a recent comments feed
	var chunk = req.query.chunk || false;
	var chunkedComments = [];
	var totalComments;
	var lastComment, lastUser, lastKifu;

	// Turn the since param into a date object
	if (since) {
		since = new Date(since);
	}

	function getTotal(callback) {
		if (totalComments) {
			callback();
		} else {
			var criteria = {};

			if (user) {
				criteria.user = user;
			}

			Comment.count(criteria, function (error, count) {
				if (error) {
					console.log('error', error);
				} else {
					totalComments = count;
					callback();
				}
			});
		}
	}

	function getUser(callback) {
		User.findOne({ username: username })
			.exec(function (error, userObject) {
				if (!error && userObject) {
					user = userObject;
					callback();
				} else {
					if (error) {
						res.json('500', { message: error });
					} else if (!user) {
						res.json('500', { message: 'That username does not exist.' });
					}
				}
			});
	}

	function getComments() {
		var comments = Comment.find()
			.sort('-date')
			.skip(offset)
			.limit(limit);

		if (user) {
			comments = comments.where('user').equals(user._id);
		}

		comments
			.populate('user', 'username email gravatar rank')
			.populate('kifu', 'shortid game public')
			.exec(function (error, comments) {
				if (!error) {
					if (chunk) {
						// Transform a Mongoose document into a JavaScript object
						comments = comments.map(function (comment) {
							return comment.toObject();
						});

						comments = _.filter(comments, function (comment) {
							return comment.kifu.public;
						});
						chunkify(comments);

						if (chunkedComments.length >= limit) {
							res.json('200', chunkedComments);
						} else {
							offset += limit;
							if (offset >= totalComments) {
								res.json('200', chunkedComments);
							} else {
								// Preserve this log to remind that this logic can be the
								// source of excess CPU usage if logic is not correct for
								// various exigencies
								//console.log('getting comments again', offset, totalComments);
								getComments();
							}
						}
					} else {
						res.json('200', comments);
					}
				} else {
					res.json('500', { message: error });
				}
			});
	}

	// Turn a flat array of comments into one where comments by the same user
	// on the same kifu are combined
	function chunkify(comments) {
		function pathPresent(path) {
			return path.path === comment.path;
		}

		function pathSorter(a, b) {
			return a.path - b.path;
		}

		// For each comment...
		for (
			var i = 0, length = comments.length;
			i < length && chunkedComments.length < limit;
			i += 1
		) {
			var comment = comments[i];

			// If this comment has the same user and kifu as the last one...
			if (
				lastComment &&
				lastUser === String(comment.user._id) &&
				lastKifu === String(comment.kifu._id)
			) {

				// Don't add multiple notifications for multiple comments on the same move
				if (lastComment.path !== comment.path) {
					// If the last comment's path isn't already an array, turn it into one
					if (!Array.isArray(lastComment.path)) {
						lastComment.path = [{ _id: lastComment._id, path: lastComment.path }];
					}

					var alreadyPresent = lastComment.path.some(pathPresent);

					if (!alreadyPresent) {
						// Push the current comment's path to the last object
						lastComment.path.push({ _id: comment._id, path: comment.path });

						lastComment.path.sort(pathSorter);
					}
				}

			} else {
				// This comment becomes the last comment
				lastComment = comment;
				lastUser = String(comment.user._id);
				lastKifu = String(comment.kifu._id);

				chunkedComments.push(comment);
			}
		}
	}

	// get the total (so we have a hard stop), then get the user if necessary,
	// then get comments
	var funcs = [];

	if (username) {
		funcs.push(getUser);
	}

	funcs.push(getTotal);
	funcs.push(getComments);
	async.series(funcs);
});

router.patch('/:id/star', function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error && comment) {
				if (comment.isOwner(req.user)) {
					res.json(550, { message: 'You can\'t star your own comment.' });
				} else {
					if (comment.stars.indexOf(req.user._id) !== -1) {
						res.json(500, { message: 'You\'ve already starred this comment.' });
					} else {
						comment.stars.push(req.user._id);
						comment.save(function (error) {
							if (!error) {
								res.json(200, { message: 'You starred comment ' + id + '.' });

								// Send notification to the starred commenter
								var notification = new Notification();
								notification.cause = 'star';
								notification.to = comment.user;
								notification.from = req.user;
								notification.kifu = comment.kifu;
								notification.path = comment.path;
								notification.comment = comment._id;

								notification.save();

								io.emit('send:' + comment.kifu, {
									change: 'star',
									comment: comment
								});
							} else {
								res.json(500, { message: 'Could not star comment. ' + error });
							}
						});
					}
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not star comment. ' + error });
			}
		});
});

router.patch('/:id/unstar', function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error && comment) {
				if (comment.isOwner(req.user)) {
					res.json(550, { message: 'You can\'t unstar your own comment, since you shouldn\'t have been' +
					'able to star it in the first place.' });
				} else {
					var index = comment.stars.indexOf(req.user._id);
					if (index === -1) {
						res.json(500, { message: 'You haven\'t starred this comment.' });
					} else {
						comment.stars.splice(index, 1);
						comment.save(function (error) {
							if (!error) {
								res.json(200, { message: 'You unstarred comment ' + id + '.' });

								// Remove the notification for this star
								Notification.find()
									.where('comment', comment)
									.where('cause').equals('star')
									.where('from').equals(req.user)
									.exec(function (error, notifications) {
										if (!error) {
											for (var i = notifications.length - 1; i >= 0; i -= 1) {
												notifications[i].remove();
											}
										} else {
											console.log('Could not delete notifications for this comment', error);
										}
									});

								io.emit('send:' + comment.kifu, {
									change: 'unstar',
									comment: comment
								});

							} else {
								res.json(500, { message: 'Could not unstar comment. ' + error });
							}
						});
					}
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not unstar comment. ' + error });
			}
		});
});

// This route gets all the comments (ALL OF THEM) and saves them
// This basically needs to be used a single time to make sure all saved
// comments have parsed HTML attributes. In the future, all comment saves
// should create this on their own.
router.get('/updatemarkdown', function (req, res) {
	var comments = Comment.find();

	comments
		.exec(function (error, comments) {
			if (!error) {
				comments.forEach(function (comment) {
					comment.save();
				});
				res.json('200', comments);
			} else {
				res.json('500', { message: error });
			}
		});
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

						if (!kifu.game.original) {
							kifu.game.original = kifu.game.sgf;
						}

						kifu.save();
					});
					comment.remove();
					res.json(200, { message: 'Comment removed.' });

					io.emit('send:' + comment.kifu, {
						change: 'delete',
						comment: comment
					});

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

							notificationHelper.notifyMentionedUsers(comment);
							res.json(200, {
								message: 'Comment updated.',
								comment: comment
							});

							io.emit('send:' + comment.kifu, {
								change: 'update',
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
