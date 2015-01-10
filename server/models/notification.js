var mongoose = require('mongoose');
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
	read: {
		type: Boolean,
		default: false
	}
});

var notification = mongoose.model('Notification', notificationSchema);

module.exports = {
	Notification: notification
};
