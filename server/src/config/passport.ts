import passport from "passport"
import bcrypt from "bcryptjs";
import { Strategy } from "passport-local"
import { User } from "../models"
import { IUser } from '../models/User'

passport.use(
	new Strategy({ usernameField: "username" }, async (username, password, done) => {
		// Check username
		let user = await User.findOne({ username: username });
		if (!user) return done(null, false, { message: "Sorry, either the username or password you entered are incorrect." });
		else {
			// Check password
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: "Sorry, either the username or password you entered are incorrect." });
				}
			});
		}
	})
);
passport.serializeUser((user: IUser, done) => {
	done(null, user._id);
});
passport.deserializeUser((obj, done) => {
	done(null, obj);
});

export default passport;