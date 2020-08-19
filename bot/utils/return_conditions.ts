import { Message, GuildChannel } from 'discord.js';

const isDev = process.env.NODE_ENV === 'development';
const commands = /stat|dice|d|login|inventory|inv|wallet|create|deleteplayer|intellidnd|add|remove|overwrite|changelog|dm/i;

/**
 * Prevent bot from running script if certain conditions are met
 */
export default function returnConditionsMet(message: Message) {
	const command = message.content.split('/')[1]?.split(' ')[0];
	switch (message.channel?.type === 'dm' && !message.author.bot) {
		case true: 
		{
			const regexTest = /stupid|bad|bot|悪|わるい/i.test(message.content);
			message.author
				.send(
					regexTest
						? `:poop:僕は悪いボットではないよ！`
						: `Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`
				)
				.catch(console.error);
			return true;
		}
		default:
		case false:
		{
			const channel = new GuildChannel(message.guild, {
				id: message.channel.id,
			});
			// Makes sure that the dev bot only runs in my dev Guild
			// and the prod bot DOESN'T run in my dev Guild
			if (
				(isDev && message.guild?.id !== '692111794411405387') ||
				(!isDev && message.guild?.id === '692111794411405387') ||
				message.author.bot
			)
				return true;
			else if (
				!channel?.permissionsFor(message.guild.me).has('SEND_MESSAGES') ||
				message.content.split('')[0] !== '/' ||
				!commands.test(command)
			)
				return true;
			else return false;
		}
	}
}
