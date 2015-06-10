var User = require('../models/user').User;
var asyncReplace = require('async-replace');

module.exports = function (text, callback) {
	function replacer(match, offset, string, done) {
		var username = match.substring(1);

		if (username) {
			User.findOne({ username: username }, function (error, user) {
				if (!error && user) {
					done(null, '<a href="/user/' + username + '">' + match + '</a>');
				} else {
					done(null, match);
				}
			});
		}
	}

	asyncReplace(text, /@[a-zA-Z0-9_-]*/g, replacer, function (error, output) {
		if (!error) {
			callback(output);
		}
	});
};
