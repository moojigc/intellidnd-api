import utils from '../utils'
import { IPlayer } from '../../../server/src/models/Player';
import { IGuild } from '../../../server/src/models/Guild';
import { Message } from 'discord.js';

export default function (message: Message) {
	const { createInventoryEmbed } = utils(message);
	let messageArr = message.content.split(" ");
	let cat = messageArr.slice(1)[0];

	async function showInventory(player: IPlayer, guild: IGuild) {
		if (cat === "@everyone") {
			// let allPlayers = guild.populate("players");
			// function validPlayers() {
			// 	return allPlayers.forEach((player) =>
			// 		player.checkExisting().then((res) => {
			// 			player.name = res.name;
			// 			if (res !== false) return createInventoryEmbed(player, "DM");
			// 		})
			// 	);
			// }
			// validPlayers();
			return message.channel.send("Still working on that feature.")
		} else {
			return createInventoryEmbed(player, "send");
		}
	}
	function showWallet(player, guild) {
		switch (cat) {
			case "@everyone":
				// let players = guild.players.map((p) => new Player(message, { id: p }));
				// players.forEach((player) => createInventoryEmbed(player, "DM", "wallet"));
				return message.channel.send("Still working on that.")
			default:
				return createInventoryEmbed(player, "send", "wallet");
		}
	}
	return {
		showInventory: showInventory,
		showWallet: showWallet
	};
};
