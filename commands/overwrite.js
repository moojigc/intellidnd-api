function overwrite(message, args, player) {
	const { coins, userEntry, createResponseEmbed } = require("../utils/globalFunctions")(message);

	const cat = args[0];
	if (!userEntry.isValid(cat)) return createResponseEmbed("send", "invalid", `Overwrite what? You must say, "/overwrite gold 90, /overwrite backpack rations," etc...`, player);

	const newItemArr = args.slice(1);
	const newItem = newItemArr.join(" ").trim();

	if ((coins.isCoin(cat) && isNaN(newItem)) || (coins.isCoin(cat) && newItem === undefined)) {
		// Users fails to specify an amount
		createResponseEmbed("send", "invalid", `You didn't specify how many ${cat}.`, player);
	} else if (coins.isCoin(cat)) {
		// Money items
		if (!newItem) {
			createResponseEmbed("send", "invalid", `How much ${cat}?`, player);
		} else {
			createResponseEmbed("send", "success", `${player.name} now has ${newItem} ${cat}.`, player);
			player.inventory[cat] = parseInt(newItem);
		}
	} else if (!userEntry.isValid(cat)) {
		// Invalid entries
		createResponseEmbed("send", "invalid", `Invalid syntax. The only valid categories are: [${validEntry.array.join(", ")}]. Type of item must come first; e.g. /overwrite gold 20, NOT /overwrite 20 gold.`, player);
	} else {
		// Non-money items
		const { addQuantity } = require("./add");
		if (!newItem) {
			createResponseEmbed("send", "invalid", `Add what to ${cat}?`, player);
		} else {
			createResponseEmbed("send", "success", `Overwrote ${player.name}'s ${cat} to ${newItem}.`, player);
			player.inventory[cat] = addQuantity(newItemArr, player.inventory[cat], "overwrite");
		}
	}
	return player;
}

module.exports = overwrite;
