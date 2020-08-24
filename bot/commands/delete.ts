import { Player, IPlayer, User, Guild, IGuild } from '../../server/models';
import utils from '../utils';
import { Message } from 'discord.js';

const deleteCharacter = async (
	message: Message,
	character: IPlayer,
	guild: IGuild
) => {
	const { createResponseEmbed } = utils(message);
	try {
		await Player.deleteOne({ _id: character._id });
		// await Guild.updateOne(
		// 	{ _id: guild._id },
		// 	{
		// 		$pull: {
		// 			players: character._id,
		// 		},
		// 	}
		// );
		// const isUserDefaultPlayer = await User.findOneAndUpdate({ defaultPlayer: character._id }, {
		// 	defaultPlayer: null,
		// })
		// const { nModified } = await User.updateOne(
		// 	{ players: character._id },
		// 	{
		// 		$pull: {
		// 			players: character._id,
		// 		},
		// 	}
		// )
		// console.log(nModified);
		createResponseEmbed('send', 'success', `Deleted ${character.name}.`);
	} catch (error) {
		createResponseEmbed('send', 'invalid', 'Server error.');
	}
};

export default deleteCharacter;
