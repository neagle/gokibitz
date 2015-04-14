var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
//var smartgame = require('smartgame');
var smartgamer = require('smartgamer')();
var moment = require('moment');
//var Comment = require('./comment').Comment;
var _ = require('lodash');

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
		var result = getProp('RE', this.game.sgf);
		// Find numbers in results
		// @see http://www.regexr.com/3afnu
		var numRegexp = /\d{0,3}\.\d{0,2}/;

		// Strip unnecessary trailing zeros
		// Example: W+5.70 → W+5.7
		return result.replace(numRegexp, function (match) {
			// Turning a number into a string strips trailing zeros through MAGIC
			return Number(match).toString();
		});
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

		if (!date) {
			return '';
		}

		// Deal with multiple dates
		// @see DT property here: http://www.red-bean.com/sgf/properties.html#DT
		date = date.split(',');

		var year, month;
		for (var i = 0; i < date.length; i += 1) {
			if (date[i].length === 10) {
				// Store year and month to use in any shortcuts that follow
				// ie, 2015-01-15,16
				var dateArray = date[i].split('-');
				year = dateArray[0];
				month = dateArray[1];
			} else if (date[i].length === 2) {
				// Expand shortcuts
				date[i] = year + '-' + month + '-' + date[i];
			}

			date[i] = moment(date[i]).format('MMMM Do, YYYY');
		}

		if (date.length <=  2) {
			if (date.length === 2) {
				var year1 = date[0].substring(date[0].length - 4);
				var year2 = date[1].substring(date[1].length - 4);

				// If the two dates are in the same year, only list the year once
				if (year1 === year2) {
					date[0] = date[0].substring(0, date[0].length - 6);
				}
			}
			date = date.join(' – ');
		} else if (date.length > 2) {
			date = date.join(', ');
		}

		return date;
	});
 
	kifuSchema.virtual('pathsWithComments')
		.get(function () {
			var paths = [];

			if (this.comments) {
				this.comments.forEach(function (comment) {
					paths.push(comment.path);
				});
			}
			console.log("Before  uniq: ", paths);
			// Remove duplicates
			paths = _.uniq(paths);

			console.log("after uniq: ", paths);

			// Turn paths into objects

			// (This can't be used with map on its own, because pathTransform accepts optional arguments)
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Example:_Tricky_use_case
			paths = paths.map(function (path) {
				return smartgamer.pathTransform(path, 'object');
			});
			return paths;

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
