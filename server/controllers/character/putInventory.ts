import { isAuth } from '../../middleware';
import { Response, NextFunction } from 'express';
import { serverError } from '../../middleware';
import { Player } from '../../models';
import { Types } from 'mongoose';
import { isEqual } from 'lodash';

/**
 * Update inventory
 */
const putInventory = async (req: RequestWithUser, res: Response) => {
	const { ObjectId } = Types;
	try {
		// Add new logs from front-end to the player instance
		let player = await Player.findOne({ webUserId: ObjectId(req.user) });
		// Destructure the inventory Object from request body
		let {
			gold,
			silver,
			copper,
			platinum,
			electrum,
			potions,
			weapons,
			misc,
		} = req.body.inventory;
		/**
		 * Fix the numbers...
		 * HTTP prot only sends strings, so you must convert strings to numbers
		 */
		const correctTypes = (category: any[]) => {
			if (!category) {
				return [];
			} else {
				return category.map((item) => {
					if (!item.name || item.quantity === 0) {
						return null;
					} else {
						return {
							name: item.name,
							quantity: parseInt(item.quantity || 0),
						};
					}
				});
			}
		};
		// Just running parseInt and correctTypes to fix the stupid numbers first...
		const inventory = {
			gold: parseInt(gold || 0),
			silver: parseInt(silver || 0),
			copper: parseInt(copper || 0),
			platinum: parseInt(platinum || 0),
			electrum: parseInt(electrum || 0),
			potions: correctTypes(potions),
			weapons: correctTypes(weapons),
			misc: correctTypes(misc),
		};

		// Case that changes were detected
		if (!isEqual(inventory, player.inventory)) {
			let response = await Player.updateOne(
				{ webUserId: req.user },
				{
					changelog: player.writeChangelog('Updated on site'),
					inventory: inventory,
				}
			);
			// Database responds positively
			if (response) res.status(200).json({ message: 'Success!' }).end();
			// Database fails to update for some reason
			else
				res.json({
					message:
						'Could not update player. Please go back to Discord and try there first.',
				}).end();
		}
		// Case that no changes were detected
		else {
			res.json({ message: 'No changes detected!' }).end();
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/inventory',
	isAuth: true,
	method: 'put',
	callback: putInventory,
};
