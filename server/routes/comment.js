var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Comment = require('../models/comment').Comment;

router.post('/', auth.ensureAuthenticated, function (req, res) {
	Kifu.findOne({
		_id: req.body._id
	}, function (error, kifu) {
		if (!error && kifu) {
			var comment = new Comment();

			comment.kifu = kifu;
			comment.user = req.user;
			comment.move = req.body.move;
			comment.content.markdown = req.body.content;

			comment.save(function (error) {
				if (!error) {
					res.json(201, { message: 'Comment created with id: ' + comment._id });
				} else {
					res.json(500, { message: 'Could not create comment. Error: ' + error });
				}
			});

		} else if (error) {
			res.json(500, { message: 'Error creating comment. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for _id:' + req.params._id });
		}
	});
});

router.get('/:id', function (req, res) {
	var id = req.params.id;

	Comment.findById(id, function (error, comment) {
		if (!error) {
			res.json('200', comment);
		} else {
			res.json('500', { message: error });
		}
	});
});

router.delete('/:id', auth.comment.hasAuthorization, function (req, res) {
	var id = req.params.id;

	Comment.findById(id, function (error, comment) {
		if (!error && comment) {
			comment.remove();
			res.json(200, { message: 'Comment removed.' });
		} else if (!error) {
			res.json(404, { message: 'Could not find comment.' });
		} else {
			res.json(403, { message: 'Could not delete comment. ' + error });
		}
	});
});

router.put('/:id', auth.comment.hasAuthorization, function (req, res) {
	var id = req.params.id;
	var content = req.body.content;

	Comment.findById(id, function (error, comment) {
		if (!error && comment) {
			comment.content.markdown = content;
			comment.save(function (error) {
				if (!error) {
					res.json(200, {
						message: 'Comment updated.',
						comment: comment
					});
				} else {
					res.json(500, { message: 'Could not update comment.' + error });
				}
			});
		} else if (!error) {
			res.json(404, { message: 'Could not find comment.' });
		} else {
			res.json(403, { message: 'Could not update comment. ' + error});
		}

	});
});

module.exports = router;
