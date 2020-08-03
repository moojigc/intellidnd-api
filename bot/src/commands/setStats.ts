import utils from '../utils';
import { Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';

/**
 * Set player stats
 */
const setStats = async (message: Message, args: string[], player: IPlayer) => {
    const { createResponseEmbed } = utils(message);
    let [property, value] = args;
    const validProps = /hp|initiative|strength|dexterity|constitution|intelligence|wisdom|charisma/i;
    if (!validProps.test(property))
        return createResponseEmbed(
            'send',
            'invalid',
            `${property} is not a valid property.`,
            player
        );
    player[property] = value;
    try {
        await player.updateOne({
            [property]: parseInt(value)
        });
        createResponseEmbed('send', 'invalid', 'Database error, failed to update.', player);
    } catch (error) {
        console.error(error);
        createResponseEmbed('send', 'success', `Set ${property} to ${value}!`, player);
    }
};

export default setStats;
