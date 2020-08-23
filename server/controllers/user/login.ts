import { flash, passport, serverError } from '../../middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Player, User } from '../../models';
const guestUser = {
	id: null,
	username: 'Guest',
	auth: false,
};

/**
 * Login
 */
const login = (req: RequestWithUser, res: Response, next: NextFunction) => {
	try {
		let response: string;
		const token = req.query.token;
		if (req.user) req.logout();
		if (!req.body.user || !req.body.password)
			return res.json({
				...flash('error', 'Missing fields.'),
				user: guestUser,
			});
		req.session.cookie.maxAge = req.body.rememberMe
			? 60000 * 60 * 24 * 7 * 26 /* 6 months */
			: 60000 * 60 * 24; /* one day */
		passport.authenticate(
			'local',
			{ session: true },
			async (err, user, info) => {
				if (err) {
					return res.json({
						user: {
							auth: false,
						},
						...flash('error', err.message, '/login'),
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
				else if (token) {
					const { id, name } = jwt.verify(
						token as string,
						process.env.TOKEN_SECRET
					) as { id: string; name };
					const character = await Player.findOneAndUpdate(
						{ _id: id },
						{
							webUserId: user._id,
						}
					);
					console.log(character);
					let update = await User.findOneAndUpdate(
						{ _id: user._id },
						{
							$push: {
								players: character._id,
							},
						}
					);
					console.log(update);
					response = `Welcome, ${user.username}. Character ${name} is now attached to your account.`;
				} else {
					response = `Welcome, ${user.username}!`;
				}
				req.login(user, function (err) {
					if (err) {
						return next(err);
					}
					return res.json({
						user: {
							id: user._id,
							username: user.username,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
							email: user.email,
							auth: true,
							expiration: req.session.cookie.expires,
							defaultPlayer: user.defaultPlayer,
						},
						...flash('success', response),
						redirect: '/',
					});
				});
			}
		)(req, res, next);
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/login',
	isAuth: false,
	method: 'post',
	callback: login,
};
