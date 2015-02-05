var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
//var smartgame = require('smartgame');
var moment = require('moment');
//var Comment = require('./comment').Comment;

var kifuSchema = new Schema({
	shortid: {
		type: String,
		index: true
	},
	game: {
		sgf: {
			type: String,
			required: true,
			default: '',
			trim: true
		},

		// Keep a reference to the original uploaded SGF
		original: {
			type: String,
			required: true,
			default: '',
			trim: true
		}
	},
	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	uploaded: {
		type: Date,
		required: true,
		default: Date.now
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	public: {
		type: Boolean,
		default: true
	},
	deleted: {
		type: Boolean,
		default: false
	},
	muted: {
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
kifuSchema.virtual('game.info.black.name')
	.get(function () {
		return getProp('PB', this.game.sgf);
	});
kifuSchema.virtual('game.info.black.rank')
	.get(function () {
		return getProp('BR', this.game.sgf);
	});

kifuSchema.virtual('game.info.white.name')
	.get(function () {
		return getProp('PW', this.game.sgf);
	});
kifuSchema.virtual('game.info.white.rank')
	.get(function () {
		return getProp('WR', this.game.sgf);
	});

kifuSchema.virtual('game.info.result')
	.get(function () {
		return getProp('RE', this.game.sgf);
	});

kifuSchema.virtual('game.info.source')
	.get(function () {
		return getProp('SO', this.game.sgf);
	});

kifuSchema.virtual('game.info.timeLimit')
	.get(function () {
		return getProp('TM', this.game.sgf);
	});

kifuSchema.virtual('game.info.rules')
	.get(function () {
		return getProp('RU', this.game.sgf);
	});

kifuSchema.virtual('game.info.application')
	.get(function () {
		return getProp('AP', this.game.sgf);
	});

kifuSchema.virtual('game.info.komi')
	.get(function () {
		return getProp('KM', this.game.sgf);
	});

kifuSchema.virtual('game.info.event')
	.get(function () {
		return getProp('EV', this.game.sgf);
	});

kifuSchema.virtual('game.info.place')
	.get(function () {
		return getProp('PC', this.game.sgf);
	});

kifuSchema.virtual('game.info.date')
	.get(function () {
		var date = getProp('DT', this.game.sgf);

		// Deal with multiple dates
		// @see DT property here: http://www.red-bean.com/sgf/properties.html
		date = date.split(',');

		// TODO: We do not yet deal with date shortcuts according to the spec.
		// (ex: 1996-05-06,07,08 = played on 6th,7th,8th May 1996)
		//
		// Luckily, DragonGo doesn't seem to use shortcuts as the spec recommends.
		//
		// But maybe somebody does or will?
		//
		// Writing a parser for this shouldn't be particularly hard, but it's worth
		// seeing if someone has already done it.
		for (var i = 0; i < date.length; i += 1) {
			date[i] = moment(date[i]).format('MMMM Do, YYYY');
		}

		if (date.length <=  2) {
			date = date.join(' – ');
		} else if (date.length > 2) {
			date = date.join(', ');
		}

		return date;
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
kifuSchema.methods.isOwner = function (user) {
	return String(this.owner) === String(user._id);
};

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

var kifu = mongoose.model('Kifu', kifuSchema);

module.exports = {
	Kifu: kifu
};
