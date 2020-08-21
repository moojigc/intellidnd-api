import passport from 'passport';
import { compare } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { User } from '../models';
import { IUser } from '../models/User';
import { emailRegex } from './index';

passport.use(
	new Strategy(
		{ usernameField: 'user' },
		async (username, password, next) => {
			// Check username
			let user = await User.findOne({
				[emailRegex.test(username) ? 'email' : 'username']: username,
			});
			if (!user)
				return next(null, false);
			else {
				// Check password
				compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						return next(null, user);
					} else {
						return next({ message: 'Sorry, either the username or password you entered are incorrect.' }, false);
					}
				});
			}
		}
	)
);
passport.serializeUser((user: IUser, next) => {
	next(null, user._id);
});
passport.deserializeUser((obj, next) => {
	next(null, obj);
});

export default passport;
