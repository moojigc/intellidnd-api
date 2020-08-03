import { Message } from 'discord.js';

const isDev = process.env.NODE_ENV === 'development';
const commands = /stat|dice|d|login|inventory|inv|wallet|create|deleteplayer|intellidnd|add|remove|overwrite|changelog|dm/i;

/**
 * Prevent bot from running script if certain conditions are met
 */
export default function (message: Message) {
    const command = message.content.split('/')[1]?.split(' ')[0];
    if (message.channel?.type === 'dm' && !message.author.bot) {
        const regexTest = /stupid|bad|bot|悪|わるい/i.test(message.content);
        message.author
            .send(
                regexTest
                    ? `:poop:僕は悪いボットではないよ！`
                    : `Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`
            )
            .catch(console.error);
        return true;
        // Makes sure that the dev bot only runs in my dev Guild
        // and the prod bot DOESN'T run in my dev Guild
    } else if (
        (isDev && message.guild?.name !== 'Bot Testing') ||
        (!isDev && message.guild?.name === 'Bot Testing') ||
        message.author.bot
    )
        return true;
    else if (
        !(message.channel as any).permissionsFor(message.guild.me).has('SEND_MESSAGES') ||
        message.content.split('')[0] !== '/' ||
        !commands.test(command)
    )
        return true;
    else return false
}
