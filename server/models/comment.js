var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var markdown = require('markdown').markdown;

var commentSchema = new Schema({
	kifu: {
		type: Schema.ObjectId,
		ref: 'Kifu'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	move: {
		type: String,
		required: true,
		trim: true
	},
	dateCreated: {
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

var comment = mongoose.model('comment', commentSchema);

module.exports = {
	Comment: comment
};
