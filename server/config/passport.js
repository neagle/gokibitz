var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');

// Serialize sessions
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findOne({ _id: id }, function (err, user) {
		done(err, user);
	});
});

// Use local strategy
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function (email, password, done) {
		User.findOne({ email: email.toLowerCase() }, function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					'errors': {
						'email': { type: 'I\'m sorry: it doesn\'t look like that email has been registered, yet.' }
					}
				});
			}
			if (!user.authenticate(password)) {
				return done(null, false, {
					'errors': {
						'password': { type: 'Password is incorrect.' }
					}
				});
			}
			return done(null, user);
		});
	})
);
