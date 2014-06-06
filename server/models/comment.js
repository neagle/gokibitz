var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var markdown = require('markdown').markdown;
var moment = require('moment');

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
		}
	}
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
});

commentSchema.virtual('content.html')
	.get(function () {
		return markdown.toHTML(this.content.markdown);
	});

commentSchema.virtual('relativeDate')
	.get(function () {
		return moment(this.date).fromNow();
	});

commentSchema.methods.isOwner = function (user) {
	return String(this.user._id) === String(user._id);
};

var comment = mongoose.model('Comment', commentSchema);

module.exports = {
	Comment: comment
};
