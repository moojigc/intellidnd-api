import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPlayer } from './Player';

const GuildSchema = new Schema({
	name: {
		type: String,
	},
	players: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Player',
		},
	],
	discordId: {
		type: String,
		unique: true,
	},
});

interface IGuildBase extends Document {
	name: string;
	discordId: string;
}

export interface IGuild extends IGuildBase {
	players: IPlayer['_id'][];
}

export interface IGuildPopulated extends IGuildBase {
	players: IPlayer[];
}

export interface IGuildModel extends Model<IGuild> {}

export const Guild = mongoose.model<IGuild, IGuildModel>('Guild', GuildSchema);
