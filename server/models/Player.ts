import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser, User } from './User';
import { Guild } from './Guild';

const PlayerSchema = new Schema({
	age: Number,
	gender: String,
	alignment: String,
	height: Number,
	weight: Number,
	faith: String,
	hair: String,
	eyes: String,
	skin: String,
	level: {
		required: true,
		type: Number,
		default: 1,
	},
	class: {
		type: String,
	},
	xp: {
		type: Number,
	},
	race: {
		type: String,
	},
	maxHp: {
		type: Number,
		default: 1,
	},
	armor: {
		type: Object,
		default: {
			class: {
				base: 0,
				shield: 0,
				dex: 0,
				magic: 0,
				misc: 0,
			},
			type: null,
			proficiency: {
				light: false,
				medium: false,
				heavy: false,
				shields: false,
			},
		},
	},
	skills: {
		type: Array,
		default: [
			{ name: 'Athletics', modifier: 0 },
			{ name: 'Acrobatics', modifier: 0 },
			{ name: 'Sleight of Hand', modifier: 0 },
			{ name: 'Stealth', modifier: 0 },
			{ name: 'Arcana', modifier: 0 },
			{ name: 'History', modifier: 0 },
			{ name: 'Investigation', modifier: 0 },
			{ name: 'Nature', modifier: 0 },
			{ name: 'Religion', modifier: 0 },
			{ name: 'Animal Handling', modifier: 0 },
			{ name: 'Insight', modifier: 0 },
			{ name: 'Medicine', modifier: 0 },
			{ name: 'Perception', modifier: 0 },
			{ name: 'Survival', modifier: 0 },
			{ name: 'Deception', modifier: 0 },
			{ name: 'Intimidation', modifier: 0 },
			{ name: 'Performance', modifier: 0 },
			{ name: 'Persuasion', modifier: 0 },
		],
	},
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
		ref: 'Guild',
	},
	notificationsToDM: {
		type: Boolean,
		default: false,
	},
	deathSaves: {
		type: Array,
		default: [],
	},
	resistances: {
		type: Array,
		default: {
			strength: 0,
			dexterity: 0,
			constitution: 0,
			intelligence: 0,
			wisdom: 0,
			charisma: 0,
		},
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
	weapons: {
		type: Object,
		default: {
			simple: false,
			martial: false,
			other: false,
		},
	},
	languages: {
		type: Array,
		default: [],
	},
	tools: {
		type: Array,
		default: [],
	},
	actions: {
		type: Object,
		default: {
			attacks: [],
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
	};
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

PlayerSchema.post('deleteOne', (doc, next) => {
	User.findOneAndUpdate(
		{ players: doc._id },
		{
			$pull: {
				players: doc._id,
			},
		}
	).then((res) => {
		if (Types.ObjectId(res.defaultPlayer).equals(doc._id)) {
			User.updateOne(
				{ _id: res._id },
				{
					defaultPlayer: null,
				}
			)
				.then(() => {
					Guild.updateOne(
						{ players: doc._id },
						{
							$pull: {
								players: doc._id,
							},
						}
					);
				})
				.then(() => next());
		} else {
			Guild.updateOne(
				{ players: doc._id },
				{
					$pull: {
						players: doc._id,
					},
				}
			).then(() => next());
		}
	});
});

export interface IPlayerModel extends Model<IPlayer> {}

export const Player = mongoose.model<IPlayer, IPlayerModel>(
	'Player',
	PlayerSchema
);
