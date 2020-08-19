import {
	RequestWithUser,
	flash,
	passport,
	serverError,
} from '../../middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Player, User } from '../../models';
import { Types } from 'mongoose';
const { ObjectId } = Types;

const addCharacter = async (req: RequestWithUser, res: Response) => {
	const respond = (type: 'error' | 'success', message: string) =>
		res.json({
			...flash(type, message),
			redirect: '/characters/add',
		});
	try {
		let { id, name } = jwt.verify(
			req.query.token as string,
			process.env.TOKEN_SECRET
		) as { id: string; name: string };
		if (!req.query.token) {
			respond( 'error', 'Token is required.');
			return;
		}
		let playerData = await Player.findOne({
			_id: id,
		});
		if (playerData) {
			let user = await User.findOne({ _id: ObjectId(req.user) }).populate(
				'players'
			);
			let characterCheck = user.players.filter(
				(p) => playerData._id.toString() === p._id.toString()
			);

			if (characterCheck.length > 0) {
				respond(
					'error',
					`${req.body.characterName} has already been added to your character list.`,
				);
				return;
			}
			// Update player with new webUserId, update user with new player IDs
			let playerResponse = await Player.updateOne(
				{ _id: ObjectId(playerData._id) },
				{ webUserId: req.user }
			);
			let userResponse = await User.updateOne(
				{ _id: ObjectId(req.user) },
				{ $push: { players: playerData._id } }
			);

			if (
				userResponse.nModified === 1 &&
				playerResponse.nModified === 1
			) {
				respond(
					'success',
					`Added ${playerData.name} to your list of characters.`
				);
			} else {
				respond(
					'error',
					`Unexpected error: Could not add ${playerData.name} to your list of characters.`
				);
			}
		} else {
			respond(
				'error',
				"Sorry, either that character doesn't exist, or the token was incorrect."
			);
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/characters',
	isAuth: true,
	method: 'post',
	callback: addCharacter,
};
