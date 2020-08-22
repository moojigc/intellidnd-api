import { flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player, User } from '../../models';
import { Types } from 'mongoose';
const { ObjectId } = Types;

const changeDefaultCharacter = async (req: RequestWithUser, res: Response) => {
	const respond = (message: string, type: 'error' | 'success') =>
		res.json({
			...flash(type, message),
			redirect: '/characters',
		});
	try {
		const player = await Player.findOne({
			_id: ObjectId(req.body.characterId),
		});
		const playerWebUserId = ObjectId(player.webUserId),
			userId = ObjectId(req.user);
		if (!playerWebUserId.equals(userId)) {
			flash('error', 'Something weird happened.');
			res.redirect('/all-characters');
			return;
		}
		const { nModified } = await User.updateOne(
			{ _id: ObjectId(req.user) },
			{ defaultPlayer: player._id }
		);
		if (nModified === 1) {
			respond(`${player.name} is now your default character.`, 'success');
		} else {
			respond(
				`${player.name} is already your default character.`,
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
