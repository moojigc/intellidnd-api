import { flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player, IPlayer, User } from '../../models';
import { Types } from 'mongoose';
const { ObjectId } = Types;

const getCharacters = async (req: RequestWithUser, res: Response) => {
	// const respond = (character: IPlayer | IPlayer[], message: string) => {
	// 	if (!character || character?.length === 0) {
	// 		res.json(flash('error', 'No characters found!'))
	// 	} else {
	// 		res.json({
	// 			...flash('success', message),

	// 		})
	// 	}
	// }
	try {
		switch (req.query.q) {
			case 'all':
				{
					const characters = await Player.find({
						webUserId: req.user,
					});
					res.json({
						...flash(
							'success',
							`${characters.length} character(s) found.`
						),
						characters: characters.map((c) => c.toObject()),
					}).end();
				}
				break;
			case 'default':
				{
					const user = await User.getDefaultPlayer(
						req.user as string
					);
					res.json({
						...flash(
							'success',
							`${user.defaultPlayer.name} found!`
						),
						character: user.defaultPlayer,
					});
				}
				break;
			default: {
				const user = await User.findOne({ _id: req.user });
				const characters = await Player.find({ webUserId: req.user });
				const [defaultPlayer] = characters.filter((c) =>
					ObjectId(user.defaultPlayer).equals(c._id)
				);
				res.json({
					...flash(
						'success',
						`${characters.length} character(s) found.`
					),
					characters: {
						default: defaultPlayer,
						all: characters,
					},
				});
			}
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '',
	method: 'get',
	isAuth: true,
	callback: getCharacters,
};
