var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var marked = require('marked');
var parseLabels = require('../utils/parseLabels.js');
var linkMoves = require('../utils/linkMoves.js');
var linkUsers = require('../utils/linkUsers.js');

marked.setOptions({
	smartypants: true
});

router.post('/', auth.ensureAuthenticated, function (req, res) {
	var text = req.body.markdown;
	text = parseLabels(text);
	text = linkMoves(text);
	linkUsers(text, function (text) {
		var html = marked(text) || '';
		res.json({
			markup: html
		});
	});
});

module.exports = router;
