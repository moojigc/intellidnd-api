// @ts-check
/**
 * Create player!
 * @param {Object} param
 * @param {string[]} param.args
 * @param {import("mongoose").Document} param.currentPlayer
 * @param {import("mongoose").Document} param.currentGuild
 * @param {import("../models/Player")} param.Player
 * @param {import("../models/Guild")} param.Guild
 * @param {{ id: string, displayName: string } | import("discord.js").GuildMember} param.recipientPlayer
 * @param {import('discord.js').Message} param.message
 * @param {Function} param.createResponseEmbed
 */
const create = async ({
	args,
	currentPlayer,
	currentGuild,
	Player,
	Guild,
	recipientPlayer,
	message,
	createResponseEmbed
}) => {
	try {
		if (currentPlayer)
			return createResponseEmbed(
				"channel",
				"invalid",
				`This user already has an inventory set up!`
			);
		let [prepack, gold, silver, copper, DMsetting] = args;
		let notificationsToDM = DMsetting === "DM" || DMsetting === "dm" ? true : false;
		let createResponse;
		let player = new Player({
			name: recipientPlayer.displayName,
			discordId: recipientPlayer.id + message.guild.id,
			guildId: message.guild.id,
			guild: message.guild.name,
			notificationsToDM: notificationsToDM
		});
		player.writeChangelog(message.content);
		if (prepack === "prepack") {
			player.createInventory("prepack", gold, silver, copper);
			createResponse = await player.save();
		} else {
			player.createInventory();
			createResponse = await player.save();
		}
		if (!currentGuild) {
			await Guild.create({
				players: createResponse._id,
				discordId: message.guild.id
			});
		} else {
			await currentGuild.updateOne({
				$push: {
					players: createResponse._id
				}
			});
		}
		if (createResponse)
			createResponseEmbed(
				"channel",
				"success",
				`Created ${recipientPlayer.displayName}'s inventory!`,
				currentPlayer
			);
		else
			createResponseEmbed(
				"channel",
				"invalid",
				"Sorry, there was an error with the database server. Please try again.",
				currentPlayer
			);
	} catch (error) {
		console.error(error);
	}
};

module.exports = create;
