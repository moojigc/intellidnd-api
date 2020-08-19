import { RequestWithUser, flash, serverError } from '../../middleware';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Player, User } from '../../models';
import { hashSync } from 'bcryptjs';

const signup = async (req: RequestWithUser, res: Response) => {
	const resJson = (msg: string, type: 'error' | 'success') =>
		res.json({
			...flash(type, msg),
			redirect: type === 'error' ? '/signup' : null,
		});
	try {
		let { email, username, password, password2, token } = req.body;
		let { id, name } = jwt.verify(token, process.env.JWT_KEY) as {
			id: string;
			name: string;
		};
		let playerData = await Player.findOne({
			_id: id,
		});

		if (!playerData) {
			resJson(`Did not find character ${name} in database.`, 'error');
			// Player registered to another user
		} else if (playerData.webUserId) {
			resJson(
				'Player is already registered. If you think this is incorrect, please reset your token.',
				'error'
			);
			// If any field is empty
		} else if (username === '' || password === '' || password2 === '') {
			resJson('Please fill in all required fields.', 'error');
			// Passwords match
		} else if (password === password2) {
			// Check for usernames
			let response = await User.findOne({ username: username });

			// If username taken
			if (response) {
				resJson('Username already taken!', 'error');
				// Username not taken
			} else {
				let user = new User({
					username: username,
					password: hashSync(password),
					email: email,
					characters: [playerData._id],
				});
				let userInsert = await User.create(user.toObject());
				if (userInsert) {
					resJson(`Welcome, ${user.username}!`, 'success');
				} else {
					resJson(
						'Could not register you. Please try again later.',
						'error'
					);
				}
			}
		} else {
			resJson('Passwords do not match.', 'error');
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	isAuth: false,
	route: '/signup',
	callback: signup,
	method: 'post',
};
