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

	notifyMentionedUsers: function (usernames, comment) {
		if (!usernames || _.isEmpty(usernames)) {
			return;
		}

		// Send out a notification to each user
		usernames.forEach(username => {
			User.findOne({ username: username }, (error, user) => {
				if (!error && user) {
					this.newNotification(comment, 'mention', user);
				} else {
					console.log(error, user);
				}
			});
		});
	}
};
