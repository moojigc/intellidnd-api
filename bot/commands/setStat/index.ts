import utils from '../../utils';
import { Message } from 'discord.js';
import { IPlayer } from '../../../server/models/Player';
import displayStats from './displayStats';
const validProps = [
	{
		name: 'hp',
		regex: /hp/i,
	},
	{
		name: 'initative',
		regex: /init(iative)?/i,
	},
	{
		name: 'strength',
		regex: /stre(ngth)?/i,
	},
	{
		name: 'dexterity',
		regex: /dext(erity)?/i,
	},
	{
		name: 'constitution',
		regex: /const(itution)?/i,
	},
	{
		name: 'intelligence',
		regex: /intell(igence)?/i,
	},
	{
		name: 'wisdom',
		regex: /wis(dom)?/i,
	},
	{
		name: 'charisma',
		regex: /char(isma)?/i,
	},
];

/**
 * Set player stats
 */
const setStats = async (message: Message, args: string[], player: IPlayer) => {
	const { createResponseEmbed } = utils(message);
	const [property, value] = args;

	if (!property) {
		await displayStats(message, player) 
		return;
	}

	let [isValidProp, propName] = ((): [boolean, string] => {
		let match =
			validProps.filter(({ regex }) => regex.test(property));
		return match.length === 1
			? [match.length === 1, match[0].name]
			: [match.length === 1, null];
	})();

	if (!isValidProp)
		return createResponseEmbed(
			'send',
			'invalid',
			`${propName} is not a valid property.`,
			player
		);

	try {
		await player.updateOne({
			stats: {
				...player.stats,
				[propName]: value,
			},
		});
		createResponseEmbed(
			'send',
			'success',
			`Set ${propName} to ${value}!`,
			player
		);
	} catch (error) {
		createResponseEmbed(
			'send',
			'invalid',
			'Database error, failed to update.',
			player
		);
		console.error(error);
	}
};

export default setStats;
