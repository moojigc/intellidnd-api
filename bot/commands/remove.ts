import { Message } from 'discord.js';
import { IPlayer, Player } from '../../server/models/Player';

import { Item } from './index';
import utils, { isCoin, isValidCategory } from '../utils';

const removeCoins = (thisCoin: string, removedItem: string) => {
	return +thisCoin + -removedItem;
};

/**
 * Non-money items
 */
const removeFromCategory = (
	thisCategory: { name: string; quantity: number }[],
	inputString: string
) => {
	// Split up input into arrays separated by any commas
	let inputArr = inputString.split(',').map((item) => item.trim());
	let oldCategory = thisCategory.map(
		(item) => new Item(item.name, +item.quantity)
	);
	// Map all input, separated by commas, to new Item objects
	const removedItemMap = inputArr
		.map((input) => {
			let [name] = input.split(' ').filter((item) => isNaN(+item));
			let [quantity] = input.split(' ').filter((item) => !isNaN(+item));
			if (!quantity) return new Item(name, 1);
			else return new Item(name, +quantity);
		})
		.filter((item) => !!item);

	// Check against existing objects
	let changedBoolean = false;
	let remaining = oldCategory
		.map((old) => {
			// For every index of oldCategory, check its .name property against each item in removedItemMap
			let matches = removedItemMap.filter(
				(removed) => removed.name === old.name
			);
			// Return old if no matches found
			if (matches.length === 0) return old;
			else {
				changedBoolean = true;
				let [reducedItem] = matches.map((match) => {
					return old.removeQuantity(match.quantity);
				});
				// If item quantity is now zero (or null), i.e. totally gone, return null
				if (reducedItem.quantity === 0 || isNaN(reducedItem.quantity))
					return null;
				else return reducedItem;
			}
		})
		.filter((item) => !!item);
	if (remaining.length === oldCategory.length && !changedBoolean) {
		return { items: oldCategory, changed: false };
	} else if (remaining.length === 0) {
		return { items: [], changed: true, removed: removedItemMap };
	} else {
		return { items: remaining, changed: true, removed: removedItemMap };
	}
};

/**
 * Remove items or coins
 */
export default async function remove(
	message: Message,
	args: string[],
	player: IPlayer
): Promise<void> {
	const { createResponseEmbed } = utils(message),
		[cat] = args,
		removedItemArr = args.slice(1),
		[removedItem] = removedItemArr,
		allRemovedItems = removedItemArr.join(' ');
	// Validate user input
	console.log(
		`${player.inventory[cat]} - ${+removedItem} = ${
			player.inventory[cat] - +removedItem
		}`
	);
	const [valid, response] = ((): [boolean, string] => {
		if (!cat || !isValidCategory(cat))
			return [
				false,
				'Remove what? Must specify /remove gold 10, /remove weapon staff, etc...',
			];
		switch (isCoin(cat)) {
			case true: {
				if (isNaN(+removedItem))
					return [
						false,
						`Can't remove **${removedItem}** from ${cat}. Reroll for intelligence, lol.`,
					];
				else if (!removedItem)
					return [false, `Remove how much from ${cat}?`];
				else if (+removedItem > player.inventory[cat])
					return [
						false,
						`You don't have enough ${cat}. Get more coins!`,
					];
				else return [true, `Removed ${removedItem} from ${cat}.`];
			}
			default:
			case false: {
				if (!removedItem) return [false, `Remove what from ${cat}?`];
				else return [true, ''];
			}
		}
	})();
	if (!valid) {
		createResponseEmbed('send', 'invalid', response, player);
		return;
	}
	switch (isCoin(cat)) {
		case true:
			{
				await Player.updateOne(
					{ _id: player._id },
					{
						inventory: {
							...player.inventory,
							[cat]: removeCoins(
								player.inventory[cat],
								removedItem
							),
						},
					}
				);
				await createResponseEmbed('send', 'success', response, player);
			}
			break;
		default:
		case false: {
			let { items, changed, removed } = removeFromCategory(
				player.inventory[cat],
				removedItemArr.join(' ')
            );
            console.log(items);
            console.log({
                [cat]: items,
                ...player.inventory
            })
			if (!changed) {
				createResponseEmbed(
					'send',
					'invalid',
					`Error: **${allRemovedItems}** not found in ${cat}. Check spelling if your input should have matched an item.`,
					player
				);
			} else {
				await Player.updateOne(
					{ _id: player._id },
					{
						inventory: {
							...player.inventory,
							[cat]: items,
						},
						lastUpdated: new Date(),
						changelog: player.writeChangelog(message.content),
					}
				);
				createResponseEmbed(
					'send',
					'success',
					`Removed ${removed
						.map((r) => r.toString)
						.join(', ')} from ${cat}.`,
					player
				);
			}
		}
	}
}
