import { flash, serverError, mapInventory } from '../../middleware';
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
				const user = await User.findOne({ _id: req.user }).populate(
					'players'
				);
				const defaultPlayer = user.players
					.filter((c) =>
						ObjectId(user.defaultPlayer).equals(c._id)
					)[0]
					.toObject();
				let inventory = mapInventory(defaultPlayer);
				defaultPlayer.inventory = inventory;
				res.json({
					...flash(
						'success',
						`${user.players.length} character(s) found.`
					),
					characters: {
						default: defaultPlayer,
						all: (user.players as any[]).map((c) => {
							let obj = c.toObject();
							obj.inventory = mapInventory(c);
							return obj;
						}),
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
