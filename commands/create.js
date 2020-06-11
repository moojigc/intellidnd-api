// @ts-check
const create = async (params) => {
	let { args, currentPlayer, currentGuild, Player, Guild, recipientPlayerObject, message, createResponseEmbed } = params;
	if (currentPlayer) return createResponseEmbed("channel", "invalid", `This user already has an inventory set up!`);
	let [prepack, gold, silver, copper, DMsetting] = args;
	let notificationsToDM = DMsetting === "DM" || DMsetting === "dm" ? true : false;
	let createResponse;
	let player = new Player({
		name: recipientPlayerObject.displayName,
		discordId: recipientPlayerObject.id + message.guild.id,
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
	if (createResponse) createResponseEmbed("channel", "success", `Created ${recipientPlayerObject.displayName}'s inventory!`, currentPlayer);
	else createResponseEmbed("channel", "invalid", "Sorry, there was an error with the database server. Please try again.", currentPlayer);
};

module.exports = create;
