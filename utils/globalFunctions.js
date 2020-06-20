const moment = require("moment");
const MessageEmbed = require("discord.js").MessageEmbed;

function capitalize(input) {
	let words = input.split(" ");
	const caps = words.map((w) => {
		let englishKeywords = {
			keywords: ["of", "a", "the", "an", "to"],
			match: function () {
				if (this.keywords.filter((keyword) => keyword === w).length > 0) return true;
				else return false;
			}
		};

		if (englishKeywords.match() === false)
			return w.slice()[0].toUpperCase() + w.substring(1).toLowerCase();
		else return w.toLowerCase();
	});
	return caps.join(" ");
}

/**
 * @module globalFunctions
 * @exports createResponseEmbed
 * @param {import("discord.js").Message} message
 */
module.exports = function (message) {
	const userEntry = {
		array: [
			"gold",
			"silver",
			"electrum",
			"platinum",
			"copper",
			"potions",
			"potion",
			"weapons",
			"weapon",
			"backpack",
			"misc"
		],
		isValid: function (cat) {
			if (this.array.includes(cat)) {
				return true;
			} else {
				return false;
			}
		}
	};
	const coins = {
		array: ["gold", "silver", "electrum", "platinum", "copper"],
		isCoin: function (cat) {
			if (this.array.includes(cat)) {
				return true;
			} else {
				return false;
			}
		}
	};
	/**
	 * Handles sending message based on user settings
	 * @param {import("../models/Player")} player
	 * @param {string} botMessageContents
	 */
	function channelOrDM(player, botMessageContents) {
		// sends message to either channel or DMs
		try {
			if (player.notificationsToDM === true) return message.author.send(botMessageContents);
			else return message.channel.send(botMessageContents);
		} catch (error) {
			console.log(error);
		}
	}
	/**
	 * Send red/green MessageEmbed
	 * @param {"send" | "channel" | "DM"} send
	 * @param {"invalid" | "success"} type
	 * @param {string} contents
	 * @param {import("../models/Player")} player required if send === "send"
	 */
	const createResponseEmbed = async (send, type, contents, player) => {
		let embed;
		try {
			if (type === "invalid") {
				embed = new MessageEmbed().setColor("RED").setDescription(contents);
			} else if (type === "success") {
				embed = new MessageEmbed().setColor("GREEN").setDescription(contents);
			}

			if (send === "send") channelOrDM(player, embed);
			else if (send === "DM") message.author.send(embed);
			else if (send === "channel") message.channel.send(embed);
		} catch (error) {
			console.log(error);
		}
	};
	/**
	 * Create user wallet or full inventory
	 * @param {import("../models/Player")} player
	 * @param {"send" | "DM"} send
	 * @param {"invalid" | "success"} type
	 */
	function createInventoryEmbed(player, send, type) {
		let embed;
		const { lastUpdated } = player;
		const {
			gold,
			silver,
			platinum,
			electrum,
			copper,
			potions,
			weapons,
			misc
		} = player.inventory;
		if (type === "wallet") {
			embed = new MessageEmbed()
				.setTitle(`${player.name}'s wallet`)
				.addFields(
					{ name: "Platinum", value: platinum, inline: true },
					{ name: "Gold", value: gold, inline: true },
					{ name: "Electrum", value: electrum, inline: true },
					{ name: "Silver", value: silver, inline: true },
					{ name: "Copper", value: copper, inline: true }
				)
				.setColor("#9B59B6")
				.setFooter(`Campaign: ${player.guild}`);
		} else {
			// add the coins together, formatted into silver
			const money =
				parseInt(platinum) * 10 +
				parseInt(gold) +
				parseInt(electrum) / 2 +
				parseInt(silver) / 10 +
				parseInt(copper) / 100;
			const List = (items) => {
				if (!items || items.length === 0) {
					return "None";
				} else {
					return items.map((item) => {
						return `${capitalize(item.name)} x${item.quantity}`;
					});
				}
			};
			embed = new MessageEmbed()
				.setTitle(`${player.name}'s inventory`)
				.addFields(
					{ name: "Coins", value: `${money} gold` },
					{ name: "Potions", value: List(potions), inline: true },
					{ name: "Weapons", value: List(weapons), inline: true },
					{ name: "Misc.", value: List(misc), inline: true },
					{ name: "Last updated", value: moment(lastUpdated).format("MMMM Do, hh:mm a") }
				)
				.setColor("#9B59B6")
				.setFooter(`Campaign: ${player.guild}`);
		}
		if (send === "send") {
			return channelOrDM(player, embed);
		} else if (send === "DM") {
			return message.author.send(embed);
		}
	}
	return {
		userEntry: userEntry,
		coins: coins,
		channelOrDM: channelOrDM,
		createResponseEmbed: createResponseEmbed,
		createInventoryEmbed: createInventoryEmbed
	};
};
