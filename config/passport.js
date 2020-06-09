const passport = require("passport"),
	LocalStrategy = require("passport-local").Strategy,
	{ User } = require("../models"),
	bcrypt = require("bcryptjs");

passport.use(
	new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
		// Check username
		let user = await User.findOne({ username: username });
		if (!user) return done(null, false, { message: "No user found by that username." });
		else {
			// Check password
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: "Password incorrect." });
				}
			});
		}
	})
);
passport.serializeUser((user, done) => {
	done(null, user._id);
});
passport.deserializeUser((obj, done) => {
	done(null, obj);
});

module.exports = passport;
