const { Schema, model } = require("mongoose");
const PlayerSchema = new Schema({
	discordId: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	guild: {
		type: String
	},
	guildId: {
		type: String,
		ref: "Guild",
		required: true
	},
	notificationsToDM: {
		type: Boolean,
		default: false
	},
	inventory: {
		type: Object,
		default: {
			potions: [],
			weapons: [],
			misc: [],
			gold: 0,
			silver: 0,
			copper: 0,
			platinum: 0,
			electrum: 0
		}
	},
	changelog: {
		type: Array
	},
	lastUpdated: {
		type: Date,
		default: Date.now
	},
	webUserId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	token: String,
	diceRollsModifiers: {
		type: Object,
		default: {
			initiative: 20
		}
	},
	hp: {
		type: Number,
		default: 1
	},
	strength: {
		type: Number,
		default: 10
	},
	dexterity: {
		type: Number,
		default: 10
	},
	constitution: {
		type: Number,
		default: 10
	},
	intelligence: {
		type: Number,
		default: 10
	},
	wisdom: {
		type: Number,
		default: 10
	},
	charisma: {
		type: Number,
		default: 10
	}
});

PlayerSchema.methods.createInventory = function (prepack, goldCoins, silverCoins, copperCoins) {
	if (prepack === "prepack") {
		let prepackaged = {
			gold: parseInt(goldCoins ? goldCoins : 0),
			silver: parseInt(silverCoins ? silverCoins : 0),
			copper: parseInt(copperCoins ? copperCoins : 0),
			platinum: 0,
			electrum: 0,
			potions: [],
			weapons: [],
			misc: [
				{
					name: "crowbar",
					quantity: 1
				},
				{
					name: "hammer",
					quantity: 1
				},
				{
					name: "pitons",
					quantity: 10
				},
				{
					name: "torches",
					quantity: 10
				},
				{
					name: "rations",
					quantity: 10
				},
				{
					name: "feet of hempen rope",
					quantity: 100
				}
			]
		};
		this.inventory = prepackaged;
	} else {
		let empty = {
			gold: 0,
			silver: 0,
			copper: 0,
			platinum: 0,
			electrum: 0,
			potions: [],
			weapons: [],
			misc: []
		};
		this.inventory = empty;
	}
	return this;
};

PlayerSchema.methods.writeChangelog = function (command) {
	this.lastUpdated = Date.now();
	let change = {
		on: Date.now(),
		command: command
	};
	if (this.changelog.length > 19) {
		// Remove oldest changes
		this.changelog.shift();
		this.changelog.push(change);
	} else {
		this.changelog.push(change);
	}
	return this.changelog;
};

const Player = model("Player", PlayerSchema);

module.exports = Player;
