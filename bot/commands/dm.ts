import { Message } from 'discord.js';
import { IPlayer, Player } from '../../server/models/Player';
import utils from '../utils';

const dm = async (message: Message, player: IPlayer) => {
    const { createResponseEmbed } = utils(message);
    const setting = message.content.split(' ')[1];
    switch (setting) {
        case 'on':
            createResponseEmbed(
                'DM',
                'success',
                'You will now receive all confirmations via DMs only.'
            );
            await Player.updateOne(
                { _id: player._id },
                {
                    notificationsToDM: true,
                    changelog: player.writeChangelog(message.content),
                    lastUpdated: new Date()
                }
            );
            break;
        case 'off':
            createResponseEmbed(
                'channel',
                'success',
                'I will now send you updates within the channel.',
                player
            );
            await Player.updateOne(
                { _id: player._id },
                {
                    notificationsToDM: false,
                    changelog: player.writeChangelog(message.content),
                    lastUpdated: new Date()
                }
            );
            break;
    }
};

export default dm;
