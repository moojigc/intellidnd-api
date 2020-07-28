module.exports = function (message) {
	const { createInventoryEmbed } = require("../utils/globalFunctions")(message);
	let messageArr = message.content.split(" ");
	let cat = messageArr.slice(1)[0];

	async function showInventory(player, guild) {
		if (cat === "@everyone") {
			let allPlayers = guild.populate("players");
			function validPlayers() {
				return allPlayers.forEach((player) =>
					player.checkExisting().then((res) => {
						player.name = res.name;
						if (res !== false) return createInventoryEmbed(player, "DM");
					})
				);
			}
			validPlayers();
		} else {
			return createInventoryEmbed(player, "send");
		}
	}
	function showWallet(player, guild) {
		switch (cat) {
			case "@everyone":
				let players = guild.players.map((p) => new Player(message, { id: p }));
				players.forEach((player) => createInventoryEmbed(player, "DM", "wallet"));
				break;
			default:
				return createInventoryEmbed(player, "send", "wallet");
		}
	}
	return {
		showInventory: showInventory,
		showWallet: showWallet
	};
};
