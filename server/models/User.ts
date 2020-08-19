import mongoose, { Schema, Document, Model } from 'mongoose';
import { hashSync } from 'bcryptjs'
import { IPlayer } from './Player';

const UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		unique: true,
		required: false,
		match: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 'Not a valid email.']
	},
	username: {
		type: String,
		unique: true,
		trim: true,
		required: true,
		validate: [({ length }) => length >= 3, 'Username must be longer.']
	},
	password: {
		type: String,
		trim: true,
		required: true,
		validate: [({ length }) => length >= 8, 'Password must be at least 8 characters.']
	},
	players: [
		{
			type: Schema.Types.ObjectId,
			ref: 'IPlayer'
		}
	],
	defaultPlayer: {
		type: Schema.Types.ObjectId,
		ref: 'IPlayer'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

UserSchema.methods.encryptPass = async function () {
	return hashSync(this.password, 15);
};

export interface IUserBase extends Document {
	email: string;
	username: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	encryptPass(): Promise<string>;
}

export interface IUser extends IUserBase {
	players: IPlayer['_id'][] | IPlayer[];
	defaultPlayer: IPlayer['_id'] | IPlayer;
}
export interface IUserPlayer extends IUserBase {
	defaultPlayer: IPlayer;
}
export interface IUserAllPlayers extends IUserBase {
	players: IPlayer[];
}
UserSchema.statics.getDefaultPlayer = async function (id) {
	return await this.findById(id).populate('defaultPlayer');
};
UserSchema.statics.getAllPlayers = async function (id) {
	return await this.findById(id).populate('players');
};
export interface IUserModel extends Model<IUser> {
	getDefaultPlayer(id: string | Schema.Types.ObjectId): Promise<IUserPlayer>;
	getAllPlayers(id: string | Schema.Types.ObjectId): Promise<IUserAllPlayers>;
}

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
