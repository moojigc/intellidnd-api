import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

const PlayerSchema = new Schema({
	discordId: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
	},
	guildId: {
		type: String,
		ref: 'Guild',
		required: true,
	},
	notificationsToDM: {
		type: Boolean,
		default: false,
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
			electrum: 0,
		},
	},
	changelog: {
		type: Array,
	},
	lastUpdated: {
		type: Date,
		default: Date.now,
	},
	webUserId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	token: String,
	initiative: {
		type: Number,
		default: 0,
	},
	stats: {
		type: Object,
		default: {
			hp: 10,
			strength: 10,
			dexterity: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10,
			charisma: 10,
		},
	},
});

interface Item {
	name: string;
	value?: number;
	quantity: number;
}

interface IPlayerBase extends Document {
	discordId: string;
	name: string;
	guild: string;
	guildId: Schema.Types.ObjectId;
	notificationsToDM: boolean;
	inventory: {
		potions: Item[];
		weapons: Item[];
		misc: Item[];
		gold: number;
		silver: number;
		copper: number;
		platinum: number;
		electrum: number;
	};
	changelog: [
		{
			on: Date;
			command: string;
		}
	];
	lastUpdated: Date;
	webUserId: IUser['_id'];
	token: String;
	stats: {
		initiative: number;
		hp: number;
		strength: number;
		dexterity: number;
		constitution: number;
		intelligence: number;
		wisdom: number;
		charisma: number;
	}
}

export interface IPlayer extends IPlayerBase {
	createInventory(
		args: [string, number, number, number]
	): IPlayerBase['inventory'];
	writeChangelog(command: string): IPlayerBase['changelog'];
}

PlayerSchema.methods.createInventory = function (args) {
	let [prepack, goldCoins, silverCoins, copperCoins] = args;
	if (prepack === 'prepack') {
		let prepackaged = {
			gold: parseInt(goldCoins ?? 0),
			silver: parseInt(silverCoins ?? 0),
			copper: parseInt(copperCoins ?? 0),
			platinum: 0,
			electrum: 0,
			potions: [],
			weapons: [],
			misc: [
				{
					name: 'crowbar',
					quantity: 1,
				},
				{
					name: 'hammer',
					quantity: 1,
				},
				{
					name: 'pitons',
					quantity: 10,
				},
				{
					name: 'torches',
					quantity: 10,
				},
				{
					name: 'rations',
					quantity: 10,
				},
				{
					name: 'feet of hempen rope',
					quantity: 100,
				},
			],
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
			misc: [],
		};
		this.inventory = empty;
	}
	return this.inventory;
};

PlayerSchema.methods.writeChangelog = function (command) {
	this.lastUpdated = new Date();
	let change = {
		on: new Date(),
		command: command,
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

export interface IPlayerModel extends Model<IPlayer> {}

export const Player = mongoose.model<IPlayer, IPlayerModel>(
	'Player',
	PlayerSchema
);
