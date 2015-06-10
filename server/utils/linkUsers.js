//var User = require('../models/user').User;

module.exports = function (text) {
	var output;
	var userRegEx = /@[a-zA-Z0-9_-]*/g;
	var matches = [];
	var match = userRegEx.exec(text);
	while (match !== null) {
		matches.push(match);
		match = userRegEx.exec(text);
	}

	//console.log(matches);

	if (matches) {
		matches.forEach(function (match) {
			console.log('match', match);
		});
	}

	//var usernames = comment.content.markdown.match(/@[a-z0-9_-]*/g);

	//if (usernames) {
		//usernames.forEach(function (username) {
			//User.findOne({ username: username }, function (error, user) {
				//if (error && user) {
				//}
			//});
		//});
	//}

	return output;
};
