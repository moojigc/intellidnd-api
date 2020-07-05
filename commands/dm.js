const dm = async (message, player) => {
	const { createResponseEmbed } = require("../utils/globalFunctions")(message);
	const setting = message.content.split(" ")[1];
	switch (setting) {
		case "on":
			createResponseEmbed(
				"DM",
				"success",
				"You will now receive all confirmations via DMs only."
			);
			await player.updateOne({
				notificationsToDM: true,
				changelog: player.writeChangelog(message.content),
				lastUpdated: Date.now()
			});
			break;
		case "off":
			createResponseEmbed(
				"channel",
				"success",
				"I will now send you updates within the channel.",
				player
			);
			await player.updateOne({
				notificationsToDM: false,
				changelog: player.writeChangelog(message.content),
				lastUpdated: Date.now()
			});
			break;
	}
};

module.exports = dm;
