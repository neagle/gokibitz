var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var multiparty = require('multiparty');
var fs = require('fs');
var smartgame = require('smartgame');
var Kifu = require('../models/kifu').Kifu;

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
			console.log('kifu', kifu);
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
	Kifu.findOne({
		shortid: req.params.shortid
	}, function (error, kifu) {
		if (!error && kifu) {
			res.json(200, kifu);
		} else if (error) {
			res.json(500, { message: 'Error loading kifu. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for that shortid.' });
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
