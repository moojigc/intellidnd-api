import jwt from 'jsonwebtoken';
import { MessageEmbed, Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';
const isDev = process.env.NODE_ENV === 'development'
/**
 * Send DM with login link connecting account to intellidnd.com using token.
 */
export default async function webLogin(message: Message, player: IPlayer) {
    const token = jwt.sign({
		id: player._id,
		name: player.name
	}, process.env.TOKEN_SECRET, { expiresIn: '7d' });
    const url = isDev ? 'http://localhost:3200/login/' : 'https://intellidnd/login/'
    let embed = new MessageEmbed().setDescription(
		`To manage **${player.name}** on *intellidnd.com*, you can [click on this special link](${url + token}?from=discord) that will allow you to login and manage ${player.name}'s data.\n\nYou can create an account if you don't have one.`
    );
    message.author.send(embed);
}
