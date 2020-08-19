import { RequestWithUser, flash, passport } from '../../middleware';
import { Response, NextFunction } from 'express';
const guestUser = {
	id: null,
	username: 'Guest',
	auth: false,
};

/**
 * Login
 */
const login = (req: RequestWithUser, res: Response, next: NextFunction) => {
	if (req.user) req.logout();
	if ((!req.body.username && !req.body.email) || !req.body.password)
		return res.json({
			...flash('error', 'Missing fields.'),
			user: guestUser,
		});
	req.session.cookie.maxAge = req.body.rememberMe
		? 60000 * 60 * 24 * 7 * 26
		: 60000 * 60 * 24;
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			console.log(err);
			return res.json({
				user: {
					auth: false,
				},
				redirect: '/login',
				...flash('error', err.message),
			});
		}
		if (!user) {
			return res.json({
				...flash('error', 'User not found.'),
				user: guestUser,
				redirect: '/login',
			});
		} 
		// else if (!user.verified) {
		// 	return res
		// 		.json({
		// 			...flash(
		// 				'error',
		// 				'Please verify your email address. If you did not receive an email from us, please check your spam folder or click the RESEND VERIFICATION button below.'
		// 			),
		// 			notVerified: true,
		// 			user: guestUser,
		// 		})
		// 		.end();
		// }
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			return res.json({
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
					auth: true,
				},
				...flash('success', `Welcome, ${req.body.username}!`),
				redirect: '/',
			});
		});
	})(req, res, next);
};

export default {
	route: '/login',
	isAuth: false,
	method: 'post',
	callback: login
};
