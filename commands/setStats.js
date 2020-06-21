const { create } = require("lodash");

/**
 * Set player stats
 * @param {import("discord.js").Message} message
 * @param {string[]} args
 * @param {import("../models/Player")} player
 */
const setStats = async (message, args, player) => {
	const { createResponseEmbed } = require("../utils/globalFunctions")(message);
	let [property, value] = args;
	const validProps = /diceRollsModifiers|hitPoints|strength|dexterity|constitution|intelligence|wisdom|charisma/i;
	if (!validProps.test(property)) return createResponseEmbed("send", "invalid", `${property} is not a valid property.`, player);
	player[property] = value;
	console.log(player);
	let response = await player.updateOne({
		[property]: parseInt(value)
	});
	if (response.nModified !== 1) createResponseEmbed("send", "invalid", "Database error, failed to update.", player);
	else createResponseEmbed("send", "success", `Set ${property} to ${value}!`, player);
};

module.exports = setStats;
