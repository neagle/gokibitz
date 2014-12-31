var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var markdown = require('markdown').markdown;

router.post('/', auth.ensureAuthenticated, function (req, res) {
	res.json({
		markup: markdown.toHTML(req.body.markdown) || ''
	});
});

module.exports = router;
