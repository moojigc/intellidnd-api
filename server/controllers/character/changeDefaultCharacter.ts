import { flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player, User } from '../../models';

const changeDefaultCharacter = async (req: RequestWithUser, res: Response) => {
	const respond = (message: string, type: 'error' | 'success') =>
		res.json({
			...flash(type, message),
			redirect: '/characters',
		});
	try {
		const character = await Player.findOne({
			_id: req.body.id,
		});
		const { nModified } = await User.updateOne(
			{ _id: req.user },
			{ defaultPlayer: character._id }
		);
		if (nModified === 1) {
			respond(
				`${character.name} is now your default character.`,
				'success'
			);
		} else {
			respond(
				`${character.name} is already your default character.`,
				'error'
			);
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/default',
	isAuth: true,
	method: 'put',
	callback: changeDefaultCharacter,
};
