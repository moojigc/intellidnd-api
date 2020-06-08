const { Schema, model } = require("mongoose");

const GuildSchema = new Schema({
	name: {
		type: String
	},
	players: [
		{
			type: Schema.Types.ObjectId,
			ref: "Player"
		}
	],
	discordId: {
		type: String,
		unique: true
	}
});

const Guild = model("Guild", GuildSchema);

module.exports = Guild;
