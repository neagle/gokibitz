var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var marked = require('marked');
var moment = require('moment');
var async = require('async');
var parseLabels = require('../utils/parseLabels.js');
var linkMoves = require('../utils/linkMoves.js');
var linkUsers = require('../utils/linkUsers.js');

marked.setOptions({
	smartypants: true
});

var commentSchema = new Schema({
	kifu: {
		type: Schema.ObjectId,
		ref: 'Kifu'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	path: {
		type: String,
		required: true,
		trim: true
	},
	date: {
		type: Date,
		required: true,
		default: Date.now
	},
	content: {
		markdown: {
			type: String,
			required: true
		},
		html: {
			type: String
		}
	},
	stars: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
});

function htmlFromMarkdown(markdown, callback) {
	var html = parseLabels(markdown);
	html = linkMoves(markdown);

	linkUsers(html, function (html) {
		html = marked(html) || '';
		callback(html);
	});
}

commentSchema.pre('save', function (next) {
	var self = this;

	htmlFromMarkdown(this.content.markdown, function (html) {
		self.content.html = html;
		next();
	});
});

commentSchema.virtual('relativeDate')
	.get(function () {
		return moment(this.date).fromNow();
	});

commentSchema.methods.isOwner = function (user) {
	return String(this.user._id) === String(user._id);
};

// Return a list of users who should be notified about a comment
commentSchema.methods.getRecipients = function (callback) {
	var newComment = this;
	var recipients = [];

	return async.series({
		populate: function (callback) {
			// Populate the kifu
			return newComment.populate('user kifu', callback);
		},

		populateKifu: function (callback) {
			// Populate the kifu's owner
			return newComment.kifu.populate('owner', callback);
		},

		comments: function (callback) {
			return newComment.model('Comment').find()
				.where('kifu', newComment.kifu)
				.where('path', newComment.path)
				.populate('user')
				.populate('kifu', 'owner')
				.exec(callback);
		}
	}, function (error, results) {
		var kifuOwner = newComment.kifu.owner;
		var comments = results.comments;

		if (!error) {

			// Add the kifu owner, if the owner is not the commenter
			if (comments.length) {
				if (!kifuOwner.equals(newComment.user)) {
					recipients.push(kifuOwner);
				}
			}

			// Add the other users who have commented on this move
			comments.forEach(function (comment) {

				if (!comment.user.equals(newComment.user)) {
					// Prevent duplicates
					// @see http://stackoverflow.com/questions/19737408/mongoose-check-if-objectid-exists-in-an-array
					var alreadyPresent = recipients.some(function (recipient) {
						return recipient.equals(comment.user);
					});

					if (!alreadyPresent) {
						recipients.push(comment.user);
					}
				}
			});

			callback(recipients);
		}
	});
};

var comment = mongoose.model('Comment', commentSchema);

module.exports = {
	Comment: comment
};
