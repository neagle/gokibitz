var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var md5 = require('MD5');

var UserSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	username: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: String,
	salt: String,
	name: String,
	admin: Boolean,
	guest: Boolean,
	provider: String,
	realName: String,
	location: String,
	bio: String,
	rank: String,
	twitter: String,
	teacher: {
		name: String,
		url: String
	},
	favorite: {
		professional: String,
		stones: String,
		opening: String
	},
	externalGoUsernames: {
		kgs: String,
		ogs: String,
		dgs: String,
		tygem: String,
		wbaduk: String
	}
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
});

/**
 * Virtuals
 */
UserSchema
	.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._password;
	});

UserSchema
	.virtual('userInfo')
	.get(function () {
		return { '_id': this._id, 'username': this.username, 'email': this.email };
	});

UserSchema
	.virtual('gravatar')
	.get(function () {
		if (this.email) {
      var hash = md5(this.email.trim().toLowerCase());
      return 'http://www.gravatar.com/avatar/' + hash;
    } else {
			return '';
		}
	});

/**
 * Validations
 */

var validatePresenceOf = function (value) {
	return value && value.length;
};

UserSchema.path('email').validate(function (email) {
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailRegex.test(email);
}, 'The specified email is invalid.');

UserSchema.path('email').validate(function (value, respond) {
	mongoose.models.User.findOne({ email: value }, function (err, user) {
		if (err) {
			throw err;
		}

		if (user) {
			return respond(false);
		}

		respond(true);
	});
}, 'The specified email address is already in use.');

UserSchema.path('username').validate(function (username) {
	var usernameRegex = /^[a-zA-Z0-9-_]+$/;
	return usernameRegex.test(username);
}, 'Usernames can only be made up of upper and lowercase letters, numbers, hyphens, and underscores.');

UserSchema.path('username').validate(function (value, respond) {
	mongoose.models.User.findOne({ username: value }, function(err, user) {
		if (err) {
			throw err;
		}

		if (user) {
			return respond(false);
		}

		respond(true);
	});
}, 'The specified username is already in use.');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
	if (!this.isNew) {
		return next();
	}

	if (!validatePresenceOf(this.password)) {
		next(new Error('Invalid password'));
	}
	else {
		next();
	}
});

/**
 * Methods
 */

UserSchema.methods = {

	/**
	 * Authenticate - check if the passwords are the same
	 */

	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashedPassword;
	},

	/**
	 * Make salt
	 */

	makeSalt: function() {
		return crypto.randomBytes(16).toString('base64');
	},

	/**
	 * Encrypt password
	 */

	encryptPassword: function(password) {
		if (!password || !this.salt) {
			return '';
		}
		var salt = new Buffer(this.salt, 'base64');
		return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	}
};

var user = mongoose.model('User', UserSchema);

module.exports = {
	User: user
};
