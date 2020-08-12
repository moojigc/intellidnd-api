import utils, { isCoin, isValidCategory, categories } from '../utils';
import { Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';

export class Item {
	name: string;
	quantity: number;
	constructor(name: string, quantity: number) {
		this.name = name;
		this.quantity = quantity;
	}
	public removeQuantity(quantity: number) {
		this.quantity -= quantity;
		return this;
	}
	get toString() {
		return `${this.quantity} ${this.name}${this.quantity > 1 ? 's' : ''}`;
	}
}

export function addQuantity(
	newItemArr: string[],
	thisCategory: Array<Item>,
	overwrite?: boolean
) {
	let newItem = newItemArr.filter((item) => item !== '').join(' ');
	let category = thisCategory.slice();
	let thisItemName = newItemArr
		.filter((item) => isNaN(item as any) && item !== ' ')
		.join(' '); // Filter out numbers and extra spaces
	let number = parseInt(
		newItemArr.filter((item) => !isNaN(item as any) && item !== '')[0]
	);
	let thisItemMap: Item;

	if (!number) {
		// Case that no quantity specified
		let number = 1;
		thisItemMap = new Item(newItem.trim(), 1);
		if (overwrite) {
			return [thisItemMap];
		} else {
			let [foundExisiting] = category.filter(
				(item) => item.name === newItem
			);
			if (category.length === 0) {
				category.push(thisItemMap);
				return category;
			} else if (foundExisiting) {
				return category.map((item) => {
					if (item.name === thisItemName) {
						if (overwrite) item.quantity = number;
						else item.quantity = item.quantity + number;
						return item;
					} else {
						return item;
					}
				});
			} else {
				category.push(thisItemMap);
				return category;
			}
		}
	} else {
		// Case that quantity is specified
		let foundExisiting = false;
		thisItemMap = new Item(thisItemName, number);
		let updated = category.map((item) => {
			if (item.name === thisItemName) {
				foundExisiting = true;
				if (overwrite) item.quantity = number;
				else item.quantity = item.quantity + number;
				return item;
			} else {
				return item;
			}
		});
		if (foundExisiting === false && overwrite) {
			category.push(thisItemMap);
			return category;
		} else if (foundExisiting && overwrite) return updated;
		else if (overwrite) return [thisItemMap];
	}
}

export function add(message: Message, args: string[], player: IPlayer) {
	const { createResponseEmbed } = utils(message);
	const cat = args[0];
	const cat2 = args[1];
	let newItemArr = args.slice(1);
	let newItem = newItemArr.join(' ');
	const addCoinsTo = (thisCoin: number) => thisCoin + parseInt(newItem);

	if (
		(isCoin(cat) && isNaN(cat2 as any)) ||
		(isCoin(cat) && cat2 === undefined)
	) {
		let response = `You didn't specify an amount to add to ${cat}.`;
		createResponseEmbed('send', 'invalid', response, player);
	} else if (!isValidCategory(cat)) {
		let response = `Invalid syntax. The only valid categories are **${categories.join(
			', '
		)}**. 
        Type of item must come first; e.g. \`/add gold 20\`, NOT \`/add 20 gold.\``;
		createResponseEmbed('send', 'invalid', response, player);
	} else if (isCoin(cat)) {
		createResponseEmbed(
			'send',
			'success',
			`Added ${newItem} ${cat} to ${player.name}'s wallet!`,
			player
		);
		player.inventory[cat] = addCoinsTo(player.inventory[cat]);
	} else if (isValidCategory(cat) && !isCoin(cat) && !newItem) {
		createResponseEmbed(
			'send',
			'invalid',
			`You didn't specify what to add to ${cat}.`,
			player
		);
	} else {
		// Non-money items
		const addToCategory = (thisCategory: Array<Item>) => {
			// Adds to new items
			let category = [...thisCategory];

			createResponseEmbed(
				'send',
				'success',
				`Added ${newItem} to ${player.name}'s ${cat}!`,
				player
			);

			if (newItem.includes(',')) {
				// Case that user adds a list of items
				let itemsList = newItem
					.trim()
					.split(',')
					.filter((item) => item !== ' ');
				itemsList.forEach((item) => {
					category.push(new Item(item.toLowerCase().trim(), 1));
				});
				return category;
			} else {
				// Case that user adds single item
				return addQuantity(newItemArr, thisCategory);
			}
		};
		player.inventory[cat] = addToCategory(player.inventory[cat]);
	}
	return player;
}
