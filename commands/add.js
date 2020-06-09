const moment = require("moment");

class Item {
	constructor(name, quantity) {
		this.name = name;
		this.quantity = quantity;
	}
	removeQuantity(quantity) {
		this.quantity -= quantity;
		return this;
	}
}

function addQuantity(newItemArr, thisCategory, addOrOverwriteQ) {
	let newItem = newItemArr.filter((item) => item !== "").join(" ");
	let category = thisCategory.slice().filter((item) => item.name !== "none");
	let thisItemName = newItemArr.filter((item) => isNaN(item) && item !== " ").join(" "); // Filter out numbers and extra spaces
	let number = parseInt(newItemArr.filter((item) => !isNaN(item) && item !== "")[0]);
	let thisItemMap;

	if (!number) {
		// Case that no quantity specified
		let number = 1;
		thisItemMap = new Item(newItem.trim(), 1);
		if (addOrOverwriteQ === "overwrite") {
			return [thisItemMap];
		} else {
			let [foundExisiting] = category.filter((item) => item.name === newItem);
			console.log(foundExisiting);
			if (category.length === 0) {
				category.push(thisItemMap);
				return category;
			} else if (foundExisiting) {
				return category.map((item) => {
					if (item.name === thisItemName) {
						if (addOrOverwriteQ === "overwrite") item.quantity = number;
						else item.quantity = parseInt(item.quantity) + number;
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
		console.log(category);
		let updated = category.map((item) => {
			if (item.name === thisItemName) {
				foundExisiting = true;
				if (addOrOverwriteQ === "overwrite") item.quantity = number;
				else item.quantity = parseInt(item.quantity) + number;
				return item;
			} else {
				return item;
			}
		});
		if (foundExisiting === false && addOrOverwriteQ !== "overwrite") {
			category.push(thisItemMap);
			return category;
		} else if (foundExisiting && addOrOverwriteQ !== "overwrite") return updated;
		else if (addOrOverwriteQ === "overwrite") return [thisItemMap];
	}
}

function add(message, args, player) {
	const { userEntry, coins, createResponseEmbed } = require("../utils/globalFunctions.js")(message);
	const cat = args[0];
	const cat2 = args[1];
	let newItemArr = args.slice(1);
	let newItem = newItemArr.join(" ");
	const addCoinsTo = (thisCoin) => parseInt(thisCoin) + parseInt(newItem);

	if ((coins.isCoin(cat) && isNaN(cat2)) || (coins.isCoin(cat) && cat2 === undefined)) {
		let response = `You didn't specify an amount to add to ${cat}.`;
		createResponseEmbed("send", "invalid", response, player);
	} else if (!userEntry.isValid(cat)) {
		let response = `Invalid syntax. The only valid categories are **${userEntry.array.join(", ")}**. 
        Type of item must come first; e.g. \`/add gold 20\`, NOT \`/add 20 gold.\``;
		createResponseEmbed("send", "invalid", response, player);
	} else if (coins.isCoin(cat)) {
		createResponseEmbed("send", "success", `Added ${newItem} ${cat} to ${player.name}'s wallet!`, player);
		player.inventory[cat] = addCoinsTo(player.inventory[cat]);
	} else if (userEntry.isValid(cat) && !coins.isCoin(cat) && !newItem) {
		createResponseEmbed("send", "invalid", `You didn't specify what to add to ${cat}.`, player);
	} else {
		// Non-money items
		function addToCategory(thisCategory) {
			// Adds to new items
			let category = thisCategory.slice().filter((item) => item.name !== "none");

			createResponseEmbed("send", "success", `Added ${newItem} to ${player.name}'s ${cat}!`, player);

			if (newItem.includes(",")) {
				// Case that user adds a list of items
				let itemsList = newItem
					.trim()
					.split(",")
					.filter((item) => item !== " ");
				itemsList.forEach((item) => {
					category.push(new Item(item.toLowerCase().trim(), 1));
				});
				return category;
			} else {
				// Case that user adds single item
				return addQuantity(newItemArr, thisCategory);
			}
		}
		player.inventory[cat] = addToCategory(player.inventory[cat]);
	}
	return player;
}

module.exports = {
	addQuantity: addQuantity,
	add: add,
	Item: Item
};
