var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/user').User;
var Kifu = require('../models/kifu').Kifu;

router.get('/:user/kifu', function (req, res) {
	var offset = req.query.offset || 0;
	var limit = Math.min(req.query.limit, 100) || 20;

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
		Kifu
			.where('owner', user)
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
	}

	findUser(req.params.user);
});

module.exports = router;
