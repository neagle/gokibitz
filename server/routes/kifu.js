var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var multiparty = require('multiparty');
var fs = require('fs');
var smartgame = require('smartgame');
var smartgamer = require('smartgamer');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Comment = require('../models/comment').Comment;
var Notification = require('../models/notification').Notification;
var _ = require('lodash');
var http = require('http');

router.get('/', function (req, res) {
	var offset = req.query.offset || 0;
	var limit = Math.min(req.query.limit, 100) || 20;
	var search = req.query.search || '';

	var criteria = {
		public: true,
		deleted: false
	};

	if (search) {
		search = new RegExp(search, 'gi');
		criteria['game.sgf'] = search;
	}

	// Get the total count of kifu
	Kifu.count(criteria, function (error, count) {
		var kifuList = Kifu
      .where('public').equals(true)
      .where('deleted').equals(false);

		if (search) {
			kifuList = kifuList
				.where('game.sgf').equals(search);
		}

		kifuList
			.sort({ uploaded: -1 })
			.skip(offset)
			.limit(limit)
			.populate('owner', 'username')
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
});

router.delete('/:id', auth.ensureAuthenticated, function (req, res) {
	Kifu
		.findById(req.params.id)
		.populate('user')
		.exec(function (error, kifu) {
			if (!error && kifu) {
				if (!kifu.isOwner(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t delete another user\'s kifu.' });
				} else {
					kifu.deleted = true;
					kifu.save(function (error) {
						if (!error) {
							res.json(200, {
								message: 'Kifu deleted.'
							});

							// Remove any notifications for this kifu
							Notification.find()
								.where('kifu', kifu)
								.exec(function (error, notifications) {
									if (!error) {
										for (var i = notifications.length - 1; i >= 0; i -= 1) {
											notifications[i].remove();
										}
									} else {
										console.log('Could not delete notifications for this kifu', error);
									}
								});
						} else {
							res.json(500, { message: 'Could not delete kifu.' + error });
						}
					});
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find kifu.' });
			} else {
				res.json(403, { messgae: 'Could not delete comment. ' + error });
			}
		});
});

router.get('/:shortid', function (req, res) {
	Kifu
		.findOne({
			shortid: req.params.shortid
		})
		.populate('owner', 'username')
		.populate('comments', 'path pathsWithComments')
		.exec(function (error, kifu) {
			if (!error && kifu) {
				res.json(200, kifu);
			} else if (error) {
				res.json(500, { message: 'Error loading kifu. ' + error });
			} else {
				res.json(404, { message: 'No kifu found for that shortid.' });
			}
		});
});

// Update a kifu
router.put('/:shortid', function (req, res) {
	console.log('Updating kifu');
	//console.log('req.body', req.body);


	if (!req.body) {
		console.log('no kifu provided');
		res.json(500, { message: 'No kifu provided.' });
	} else {
		console.log('finding that kifu');
		Kifu
			.findOne({
				shortid: req.params.shortid
			})
			.populate('owner', 'username')
			.exec(function (error, kifu) {
				if (!error && kifu) {
					if (!kifu.owner.equals(req.user) && !req.user.admin) {
						console.log('you can\'t edit this!');
						res.json(550, { message: 'You can\'t edit another user\'s kifu.' });
					} else {
						kifu = _.assign(kifu, req.body);
						console.log('updated', kifu);

						// Old kifu did not have an original created at upload time
						if (!kifu.game.original) {
							kifu.game.original = kifu.game.sgf;
						}

						kifu.save(function (error) {
							console.log('kifu saved', arguments);
							if (!error) {
								res.json(200, {
									message: 'Kifu updated.',
									kifu: kifu
								});
							} else {
								res.json(500, { message: 'Could not save kifu. ' + error });
							}
						});
					}
				} else if (error) {
					res.json(500, { message: 'Error loading kifu. ' + error });
				} else {
					res.json(404, { message: 'No kifu found for that shortid.' });
				}
			});
	}
});

// TODO: Why does the _API_ need a shortid? That's only for pretty URLs.
// Change to _id
router.get('/:shortid/sgf', function (req, res) {
	Kifu.findOne({
		shortid: req.params.shortid
	}, function (error, kifu) {
		if (!error && kifu) {
			var sgf;

			var addCommentsToSgf = function (callback) {
				Comment.find({ kifu: kifu._id })
					.populate('user')
					.exec(function (error, comments) {
						// Transform a Mongoose document into a JavaScript object
						comments = comments.map(function (comment) {
							return comment.toObject();
						});

						var gamer = smartgamer(smartgame.parse(kifu.game.sgf));

						comments.forEach(function (comment) {
							gamer.goTo(comment.path);
							var str = gamer.comment();

							if (str) {
								str += '\n';
							}

							str = str + comment.user.username + ': ' + comment.content.markdown + '\n';

							gamer.comment(str);
						});

						sgf = smartgame.generate(gamer.getSmartgame());
						callback();
					});
			};

			var getUser = function () {
				User.findOne({
					_id: kifu.owner
				}, function (error, owner) {
					//console.log(kifu, owner);
					var filename = owner.username + '--' +
						kifu.game.info.black.name +
						'-vs-' +
						kifu.game.info.white.name +
						'.sgf';
					res.set({
						'Content-Disposition': 'attachment; filename=' + filename,
						'Content-Type': 'application/x-go-sgf'
					});
					res.send(200, sgf);
				});
			};

			if (req.query.nocomments) {
				sgf = kifu.game.sgf;
				getUser();
			} else {
				addCommentsToSgf(getUser);
			}
		} else if (error) {
			res.json(500, { message: 'Error loading kifu. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for that shortid.' });
		}
	});
});

router.get('/:id/comments/:path?', function (req, res) {
	Kifu.findOne({
		_id: req.params.id
	}, function (error, kifu) {
		if (!error && kifu) {
			var findOptions = {
				kifu: kifu
			};

			if (req.params.path) {
				//console.log('checking for path', req.params.path);
				findOptions.path = req.params.path;
				//findOptions.path = decodeURIComponent(req.params.path);
			}

			Comment
				.find(findOptions)
				.sort({
					// For a lit of all comments, use reverse chron
					// For path-specific comments, use chron
					date: (findOptions.path) ? 'asc' : 'desc'
				})
				.populate('user', 'username email gravatar rank')
				.exec(function (error, comments) {
					if (error) {
						res.json(500, { message: 'Error loading comments. ' + error });
					} else {
						if (!comments.length) {
							comments = [];
						}
						res.json(200, comments);
					}
				});
		} else if (error) {
			res.json(500, { message: 'Error loading kifu. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for that id.' });
		}
	});
});

// Update an SGF
router.put('/:id/sgf', auth.ensureAuthenticated, function (req, res) {
	var sgf = req.body.sgf;

	Kifu.findOne({
		_id: req.params.id
	})
		.populate('owner')
		.exec(function (error, kifu) {
			if (!error && kifu) {
				if (!kifu.owner.equals(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t edit another user\'s kifu.' });
				} else {
					// Make sure there's an original
					if (!kifu.game.original) {
						kifu.game.original = kifu.game.sgf;
					}

					kifu.game.sgf = sgf;

					kifu.save(function (error) {
						if (!error) {
							res.json(200, {
								message: 'SGF updated.',
								kifu: kifu
							});
						} else {
							res.json(500, { message: 'Error saving kifu. ' + error });
						}
					});
				}
			} else if (error) {
				res.json(500, { message: 'Error loading kifu. ' + error });
			} else {
				res.json(404, { message: 'No kifu found for that id.' });
			}
		});
});

router.post('/upload', auth.ensureAuthenticated, function (req, res) {
	function createKifu(sgf, public) {

		var newKifu = new Kifu();

		newKifu.owner = req.user;
		newKifu.public = (typeof public === 'undefined') ? true : public;
		newKifu.game.sgf = sgf;
		newKifu.game.original = sgf;
		newKifu.save(function (error) {
			if (!error) {
				res.json(201, {
					message: 'Kifu successfully created!',
					_id: newKifu._id,
					shortid: newKifu.shortid
				});
			} else {
				res.json(500, { message: 'Could not create kifu. Error: ' + error });
			}
		});
	}

	if (req.body.rawSgf) {
		// Create a new Kifu from uploaded text
		createKifu(req.body.rawSgf, req.body.public);
	} else if (req.body.url) {
		// Create a new Kifu from an SGF fetched from a URL
		http.get(req.body.url, function (fetchRes) {
			var request = this;
			var sgf = '';
			fetchRes.on('data', function (chunk) {
				sgf += chunk;
				if (sgf.length > 10000) {
					request.abort();
					res.json(500, { message: 'This seems way too big to be an SGF.' });
				}
			});

			fetchRes.on('end', function () {
				createKifu(sgf, req.body.public);
			});
		}).on('error', function (error) {
			res.json(500, { message: 'Could not create kifu from URL. ' + error });
		});
	} else {
		var form = new multiparty.Form();

		form.parse(req, function (error, fields, files) {
			files.file.forEach(function (file) {
				var sgf = fs.readFileSync(file.path, { encoding: 'utf-8' });
				//var game = smartgame.parse(sgf);
				createKifu(sgf, (fields.public[0] === 'true') ? true : false);
			});
		});
	}
});

module.exports = router;
