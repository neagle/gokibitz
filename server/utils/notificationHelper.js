var Notification = require('../models/notification').Notification;
var User = require('../models/user').User;

module.exports = {
	newNotification: function (comment, cause, to) {
		var notification = new Notification();
		notification.cause = cause;
		notification.to = to;
		notification.from = comment.user;
		notification.kifu = comment.kifu;
		notification.path = comment.path;
		notification.comment = comment._id;

		notification.save();
	},

	notifyMentionedUsers: function (comment) {
		var usernames = comment.content.markdown.match(/@[a-zA-Z0-9_-]*/g);
		var me = this;

		if (usernames) {
			usernames = usernames.map(function (x) {
				return x.replace('@', '');
			});

			usernames = usernames.filter(function (username) {
				return username.length !== 0 && comment.user.username !== username;
			});
			//console.log(usernames);

			// Send out a notification to each user
			usernames.forEach(function (username) {
				User.findOne({ username: username }, function (error, user) {
					if (!error && user) {
						me.newNotification(comment, 'mention', user);
					} else {
						console.log(error, user);
					}
				});
			});
		}

	}
};
