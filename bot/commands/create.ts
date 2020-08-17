import { IPlayer, IPlayerModel } from '../../server/models/Player';
import { IGuildModel, IGuild } from '../../server/models/Guild';
import { GuildMember, Message } from 'discord.js';
import utils from '../utils';

interface CreateParams {
    args: string[];
    currentPlayer: IPlayer;
    currentGuild: IGuild;
    Player: IPlayerModel;
    Guild: IGuildModel;
    recipientPlayer:
        | {
              id: string;
              displayName: string;
          }
        | GuildMember;
    message: Message;
}

/**
 * Create player!
 */
const create = async ({
    args,
    currentPlayer,
    currentGuild,
    Player,
    Guild,
    recipientPlayer,
    message
}: CreateParams) => {
    const { createResponseEmbed } = utils(message);
    try {
        if (currentPlayer)
            return createResponseEmbed(
                'channel',
                'invalid',
                `This user already has an inventory set up!`
            );
        let notificationsToDM = /dm/i.test(args[4]);
        let player = new Player({
            name: recipientPlayer.displayName,
            discordId: recipientPlayer.id + message.guild.id,
            guildId: message.guild.id,
            guild: message.guild.name,
            notificationsToDM: notificationsToDM
        });
        player.writeChangelog(message.content);
		player.createInventory([args[0], parseInt(args[1]), parseInt(args[2]), parseInt(args[3])]);
        console.log(player);
        console.log(currentGuild)
        let dbPlayer = await Player.create(player);
        if (!currentGuild) {
            await Guild.create({
                players: [player],
                discordId: message.guild.id,
                name: message.guild.name
            });
        } else {
            await Guild.updateOne(
                { _id: currentGuild._id },
                {
                    $push: {
						// @ts-ignore
						players: dbPlayer._id
                    }
                }
            );
        }
        createResponseEmbed(
            'channel',
            'success',
            `Created ${recipientPlayer.displayName}'s inventory!`,
            currentPlayer
        );
    } catch (error) {
        console.error(error);
        createResponseEmbed(
            'channel',
            'invalid',
            'Sorry, there was an error with the database server. Please try again.',
            currentPlayer
        );
    }
};

export default create;