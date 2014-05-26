var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
var smartgame = require('smartgame');
var moment = require('moment');
//var Comment = require('./comment').Comment;

var kifuSchema = new Schema({
	shortid: {
		type: String
	},
	game: {
		sgf: {
			type: String,
			required: true,
			default: '',
			trim: true
		}
	},
	comments: [{
		type: Schema.ObjectId,
		ref: 'comment'
	}],
	uploaded: {
		type: Date,
		required: true,
		default: Date.now
	},
	owner: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	public: {
		type: Boolean,
		default: true
	},
	deleted: {
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

function getProp(prop, str) {
	var re = new RegExp(prop + '\\[([^\\]]*)\\]');
	var match = re.exec(str);
	return (match) ? match[1] : '';
}

/**
 * Game Information
 */
kifuSchema.virtual('game.info.black')
	.get(function () {
		return getProp('PB', this.game.sgf);
	});

kifuSchema.virtual('game.info.white')
	.get(function () {
		return getProp('PW', this.game.sgf);
	});

kifuSchema.virtual('game.info.result')
	.get(function () {
		return getProp('RE', this.game.sgf);
	});

kifuSchema.virtual('game.info.date')
	.get(function () {
		var date = getProp('DT', this.game.sgf);
		return moment(date).format('MMMM Do, YYYY');
	});

/**
 * Comment Information
 */

//kifuSchema.virtual('game.obj')
	//.get(function () {
		//console.log(smartgame.parse(this.game.sgf));
		//return this.game.sgf;
		////return smartgame.parse(this.game.sgf);
	//});

/**
 * Pre hook.
 */
kifuSchema.pre('save', function (next, done) {
	if (this.isNew) {
		this.shortid = shortid.generate();
	}
	next();
});

/**
 * Statics
 */
kifuSchema.statics = {
	load: function (id, callback) {
		this.findOne({
			_id: id
		})
			.populate('owner', 'username')
			.exec(callback);
	}
};

var kifu = mongoose.model('kifu', kifuSchema);

module.exports = {
	Kifu: kifu
};
