var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	res.render('index');
});

// Serve up partials for Angular routes
router.get('/partials/:name', function (req, res) {
	res.render('partials/' + req.params.name);
});


module.exports = router;
