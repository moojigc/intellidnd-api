import dotenv from 'dotenv';
dotenv.config();
import { Client, MessageEmbed } from 'discord.js';
import moment from 'moment';
import { Player, Guild } from '../../server/src/models';
import { connect } from 'mongoose';
const client = new Client({ disableMentions: 'everyone' });
import utils, { checkPermissions, returnConditionsMet } from './utils';
import { add, changelog, invWallet, create, dm, help, setStats, webLogin, roll, overwrite, remove } from './commands';

connect(process.env.MONGODB_URI || 'mongodb://localhost/dnd-inventory', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).catch(console.error);

client.once('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    try {
        let link = await client.generateInvite([
            'MANAGE_MESSAGES',
            'SEND_MESSAGES',
            'READ_MESSAGE_HISTORY',
            'EMBED_LINKS'
        ]);
        console.log(link);
    } catch (e) {
        console.log(e.stack);
    }
});

client.on('guildCreate', async (guild) => {
    try {
        let [defaultChannel] = guild.channels.cache.filter((channel) => {
            if (channel.type == 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
                return true;
            else return false;
        });
        (defaultChannel[1] as any).send('Hello! To see a list of commands, run **/intellidnd**.');
    } catch (error) {
        console.log(error);
    }
});

client.on('message', async (message) => {
    try {
        if (returnConditionsMet(message)) return;
        const command = message.content.toLowerCase().split('/')[1]?.split(' ')[0],
            { createResponseEmbed } = utils(message),
            { args, recipientPlayer, insufficientPerms } = checkPermissions(message);
        if (insufficientPerms)
            return createResponseEmbed(
                'channel',
                'invalid',
                `User <@${message.author.id}> does not have sufficient privileges for this action.`
            );
        let currentGuild = await Guild.findOne({ discordId: message.guild.id });
        let currentPlayer = await Player.findOne({
            discordId: recipientPlayer.id + message.guild.id
        });
        // commands usable by anyone
        const allUserCommands = (input: string) => /create|intellidnd|dice|d/.test(input);
        if (
            !currentPlayer &&
            !allUserCommands(command) &&
            recipientPlayer.displayName !== '@everyone'
        )
            return createResponseEmbed(
                'channel',
                'invalid',
                `No data for ${recipientPlayer.displayName}. Run /create to start an inventory for this player.`
            );
        // Auto change names
        if (currentPlayer && currentPlayer.name !== recipientPlayer.displayName) {
            await Player.updateOne(
                { discordId: recipientPlayer.id + message.guild.id },
                { name: recipientPlayer.displayName }
            );
        }
        switch (command) {
            case `inv`:
            case `inventory`:
                {
                    invWallet(message).showInventory(currentPlayer, currentGuild);
                }

                break;
            case `wallet`:
                {
                    invWallet(message).showWallet(currentPlayer, currentGuild);
                }

                break;
            case `add`:
                {
                    currentPlayer.updateOne({
                        inventory: add(message, args, currentPlayer).inventory,
                        changelog: currentPlayer.writeChangelog(message.content),
                        lastUpdated: new Date()
                    });
                }

                break;
            case `remove`:
                {
                    remove(message, args, currentPlayer);
                }

                break;
            case `overwrite`:
                {
                    overwrite(message, args, currentPlayer);
                }

                break;
            case `create`:
                {
                    create({
                        Player: Player,
                        Guild: Guild,
                        currentGuild: currentGuild,
                        currentPlayer: currentPlayer,
                        args: args,
                        recipientPlayer: recipientPlayer,
                        message: message
                    });
                }

                break;
            case `deleteplayer`:
                {
                    await currentPlayer.remove();
                    createResponseEmbed(
                        'channel',
                        'success',
                        `Player ${recipientPlayer.displayName}'s inventory successfully deleted.`
                    );
                }

                break;
            case `dm`:
                {
                    dm(message, currentPlayer);
                }

                break;
            case `helpinventory`:
            case `intellidnd`:
                {
                    help(message);
                }
                break;
            case `changelog`:
                {
                    changelog(message, currentPlayer, moment);
                }
                break;

            case `login`:
                {
                    webLogin(message, currentPlayer);
                }
                break;
            case `d`:
            case `dice`:
                {
                    roll({
                        message: message,
                        player: currentPlayer,
                        discordMember: recipientPlayer,
                        args: args
                    });
                }
                break;
            case `stat`:
                {
                    setStats(message, args, currentPlayer);
                }
                break;
            default:
                // Keep blank so the bot doesn't interfere with other bots
                return;
        }
    } catch (err) {
        console.error(err);
        let errorEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`Something went wrong!`)
            .setDescription(
                `Hi **${message.author.username}**,\nYou tried to execute: \`${message.content}\` but it returned the following error.`
            )
            .addField(
                'Problem:',
                `\`${err}\`.
            If you did not get any other error messages describing the issue in plain English, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`
            )
            .addField('At:', moment().format('MMMM Do, hh:mm a'));

        if (!message.author.bot) message.author.send(errorEmbed);
    }
});
// end of client.on('message)
client.login(process.env.BOT_TOKEN);
