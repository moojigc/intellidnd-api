import { RequestWithUser, isAuth, serverError } from '../../middleware';
import { Response, NextFunction } from 'express';
import { User, Player } from '../../models';
import { Types } from 'mongoose';

const getInventory = async (
	req: RequestWithUser,
	res: Response
) => {
	const { ObjectId } = Types;
	try {
		if (!req.query.id) {
			let { defaultPlayer } = await User.findOne({
				_id: ObjectId(req.user),
			}).populate('defaultPlayer');
			res.json({
				player: defaultPlayer.toObject(),
			}).end();
		} else {
			try {
				let player = await Player.findOne({
					_id: Object(req.params.id),
				});
				res.json({
					player: player.toObject(),
				});
			} catch (error) {
				serverError(res, error);
			}
		}
	} catch (error) {
		serverError(res, error);
	}
}

export default {
	route: '/inventory',
	method: 'get',
	isAuth: true,
	callback: getInventory
}
