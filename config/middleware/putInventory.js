// @ts-check
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = async (req, res, { Player, ObjectId, isEqual }) => {
	if (!req.user) {
		res.json({ message: "You must be logged in to do that." });
	} else {
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
				misc
			} = req.body.inventory;
			/**
			 * Fix the numbers...
			 * HTTP prot only sends strings, so you must convert strings to numbers
			 * @param {Array} category
			 */
			const correctTypes = (category) => {
				if (!category) {
					return [];
				} else {
					return category.map((item) => {
						if (!item.name || item.quantity === 0) {
							return null;
						} else {
							return {
								name: item.name,
								quantity: parseInt(item.quantity || 0)
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
				misc: correctTypes(misc)
			};

			// Case that changes were detected
			if (!isEqual(inventory, player.inventory)) {
				let changelog = {
					on: Date.now(),
					command: "Updated on website."
				};
				let response = await Player.updateOne(
					{ webUserId: req.user },
					{ $push: { changelog: changelog }, inventory: inventory }
				);
				// Database responds positively
				if (response) res.status(200).json({ message: "Success!", status: 200 }).end();
				// Database fails to update for some reason
				else
					res.status(404).json({
						message:
							"Could not update player. Please go back to Discord and try there first.",
						status: 404
					});
			}
			// Case that no changes were detected
			else {
				res.status(202).json({ message: "No changes detected!", status: 202 }).end();
			}
		} catch (error) {
			console.error(error);
			res.json({
				redirectURL: "/server-error",
				message: "Internal server error. Please try again later.",
				status: 500
			}).end();
		}
	}
};
