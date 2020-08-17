import { Message } from 'discord.js';
import { IPlayer } from '../../server/models/Player';
import utils, { isValidCategory, isCoin, categories } from '../utils';

/**
 * Overwrite an inventory category
 */
export default async function overwrite(
	message: Message,
	args: string[],
	player: IPlayer
) {
	const { createResponseEmbed } = utils(message);

	const [cat] = args;

	if (!isValidCategory(cat))
		return createResponseEmbed(
			'send',
			'invalid',
			`Overwrite what? You must say, "/overwrite gold 90, /overwrite backpack rations," etc...`,
			player
		);

	const newItemArr = args.slice(1);

	const newItem = newItemArr.join(' ').trim();

	if (
		(isCoin(cat) && isNaN(Number(newItem))) ||
		(isCoin(cat) && newItem === undefined)
	) {
		// Users fails to specify an amount
		createResponseEmbed(
			'send',
			'invalid',
			`You didn't specify how many ${cat}.`,
			player
		);
	} else if (isCoin(cat)) {
		// Money items
		if (!newItem) {
			createResponseEmbed('send', 'invalid', `How much ${cat}?`, player);
		} else {
			createResponseEmbed(
				'send',
				'success',
				`${player.name} now has ${newItem} ${cat}.`,
				player
			);
			player.inventory[cat] = parseInt(newItem);
			await player.updateOne({
				inventory: player.inventory,
				changelog: player.writeChangelog(message.content),
				lastUpdated: Date.now(),
			});
		}
	} else if (!isValidCategory(cat)) {
		// Invalid entries
		createResponseEmbed(
			'send',
			'invalid',
			`Invalid syntax. The only valid categories are: [${categories.join(
				', '
			)}]. Type of item must come first; e.g. /overwrite gold 20, NOT /overwrite 20 gold.`,
			player
		);
	} else {
		// Non-money items
		const { addQuantity } = require('./add');
		if (!newItem) {
			createResponseEmbed(
				'send',
				'invalid',
				`Add what to ${cat}?`,
				player
			);
		} else {
			createResponseEmbed(
				'send',
				'success',
				`Overwrote ${player.name}'s ${cat} to ${newItem}.`,
				player
			);
			player.inventory[cat] = addQuantity(
				newItemArr,
				player.inventory[cat],
				true
			);
			await player.updateOne({
				inventory: player.inventory,
				changelog: player.writeChangelog(message.content),
				lastUpdated: new Date(),
			});
		}
	}
	return player;
}
