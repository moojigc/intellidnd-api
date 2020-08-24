import { Player } from '../../../server/models';
import utils, { capitalize } from '../../utils';
import { Message, MessageEmbed } from 'discord.js';
import { IPlayer } from '../../../server/models/Player';

/**
 * Display player's stats in MessageEmbed
 */
const displayStats = async (
	message: Message,
	player: IPlayer,
	property: string
) => {
	const { channelOrDM } = utils(message);
	const { stats } = player;
	const embed = (() => {
		if (property) {
			return new MessageEmbed()
				.setTitle(`${player.name}'s ${property}`)
				.setDescription(player.stats[property]);
		} else {
			return new MessageEmbed()
				.setTitle(`${player.name}'s Stats`)
				.addFields(
					Object.entries(stats).map(([stat, key]) => ({
						name: stat === 'hp' ? 'Hit Points' : capitalize(stat),
						value: key,
					}))
				);
		}
	})();

	await channelOrDM(player, embed);
};

export default displayStats;
