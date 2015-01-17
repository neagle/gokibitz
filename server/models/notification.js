var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
	to: {
		type: Schema.ObjectId,
		ref: 'User'
	},

	from: {
		type: Schema.ObjectId,
		ref: 'User'
	},

	cause: {
		type: String,
		default: 'new comment',
		required: true
	},

	comment: {
		type: Schema.ObjectId,
		ref: 'Comment'
	},

	date: {
		type: Date,
		required: true,
		default: Date.now
	},

	content: {
		type: String,
		required: false
	},

	kifu: {
		type: Schema.ObjectId,
		ref: 'Kifu'
	},

	path: {
		type: String,
		required: true,
		trim: true
	},

	// Past tense. Rhymes with red.
	read: {
		type: Boolean,
		default: false
	}
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
});

notificationSchema.virtual('relativeDate')
	.get(function () {
		return moment(this.date).fromNow();
	});

var notification = mongoose.model('Notification', notificationSchema);

module.exports = {
	Notification: notification
};
