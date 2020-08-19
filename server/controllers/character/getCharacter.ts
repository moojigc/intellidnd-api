import { RequestWithUser, flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player } from '../../models';

const getCharacter = async (req: RequestWithUser, res: Response) => {
	try {
		let character = await Player.findOne({ webUserId: req.user });
		res.json({
			...flash('success', `${character.name} found.`),
			character: character.toObject(),
		});
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/:id',
	method: 'get',
	isAuth: true,
	callback: getCharacter,
};
