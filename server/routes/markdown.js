var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var marked = require('marked');
var parseLabels = require('../utils/parseLabels.js');

router.post('/', auth.ensureAuthenticated, function (req, res) {
	var html = marked(parseLabels(req.body.markdown)) || '';
	res.json({
		markup: html
	});
});

module.exports = router;
