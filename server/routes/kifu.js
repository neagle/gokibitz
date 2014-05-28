var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var multiparty = require('multiparty');
var fs = require('fs');
var smartgame = require('smartgame');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Comment = require('../models/comment').Comment;

router.get('/', function (req, res) {
	var offset = req.query.offset || 0;
	var limit = Math.min(req.query.limit, 100) || 20;

	Kifu
		.where('public').equals(true)
		.where('deleted').equals(false)
		.sort({ uploaded: -1 })
		.skip(offset)
		.limit(limit)
		.exec(function (error, kifu) {
			if (!error && kifu.length) {
				res.json(200, kifu);
			} else if (error) {
				res.json(500, { message: 'Error loading kifu. ' + error });
			} else {
				res.json(404, { message: 'No kifu found.' });
			}
		});

	//Kifu.find({
		//owner: req.user
	//}, function (error, kifu) {
		//if (!error && kifu) {
			//res.json(200, kifu);
		//} else if (error) {
			//res.json(500, { message: 'Error loading kifu. ' + error });
		//} else {
			//res.json(404, { message: 'This user hasn\'t uploaded any kifu, yet.' });
		//}
	//});
});

router.get('/:shortid', function (req, res) {
	Kifu
		.findOne({
			shortid: req.params.shortid
		})
		// TODO: Figure out how to attach comments for the kifu.
		.populate('comments')
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

// TODO: Why does the _API_ need a shortid? That's only for pretty URLs.
// Change to _id
router.get('/:shortid/sgf', function (req, res) {
	Kifu.findOne({
		shortid: req.params.shortid
	}, function (error, kifu) {
		if (!error && kifu) {
			User.findOne({
				_id: kifu.owner
			}, function (error, owner) {
				console.log(kifu, owner);
				var filename = owner.username + '--' +
					kifu.game.info.black +
					'-vs-' +
					kifu.game.info.white +
					'.sgf';

				res.set({
					'Content-Disposition': 'attachment; filename=' + filename,
					'Content-Type': 'application/x-go-sgf'
				});
				res.send(200, kifu.game.sgf);
			});
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
	} ,function (error, kifu) {
		if (!error && kifu) {
			var findOptions = {
				kifu: kifu
			};

			if (req.params.path) {
				console.log('checking for path', req.params.path);
				findOptions.path = req.params.path;
				//findOptions.path = decodeURIComponent(req.params.path);
			}

			Comment
				.find(findOptions)
				.populate('user', 'username email gravatar')
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

router.post('/upload', auth.ensureAuthenticated, function (req, res) {
	var form = new multiparty.Form();

	form.parse(req, function (error, fields, files) {
		files.file.forEach(function (file) {
			var sgf = fs.readFileSync(file.path, { encoding: 'utf-8' });
			var game = smartgame.parse(sgf);
			var newKifu = new Kifu();

			newKifu.owner = req.user;
			newKifu.game.sgf = sgf;
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
		});
	});
});

module.exports = router;
