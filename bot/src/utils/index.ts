import moment from 'moment';
import { MessageEmbed, Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';

const capitalize = (input: string, ...exceptions: string[]) => {
    let words = input.split(' ');
    let keywords = ['of', 'a', 'the', 'an', 'to', ...exceptions];
    let match = (word: string) => keywords.filter((keyword) => keyword === word).length > 0;
    const caps = words.map((w) => {
        if (!match(w)) return w.slice()[0].toUpperCase() + w.substring(1).toLowerCase();
        else return w.toLowerCase();
    });
    return caps.join(' ');
};

export { default as checkPermissions } from './check_permissions';
export { default as returnConditionsMet } from './return_conditions';

export default function (message: Message) {
    const userEntry = {
        array: [
            'gold',
            'silver',
            'electrum',
            'platinum',
            'copper',
            'potions',
            'potion',
            'weapons',
            'weapon',
            'backpack',
            'misc'
        ],
        isValid: function (cat: string) {
            if (this.array.includes(cat)) {
                return true;
            } else {
                return false;
            }
        }
    };
    const coins = {
        array: ['gold', 'silver', 'electrum', 'platinum', 'copper'],
        isCoin: function (cat: string) {
            if (this.array.includes(cat)) {
                return true;
            } else {
                return false;
            }
        }
    };
    /**
     * Handles sending message based on user settings
     */
    const channelOrDM = (player: IPlayer, botMessageContents: string | MessageEmbed) => {
        // sends message to either channel or DMs
        try {
            if (player.notificationsToDM === true) return message.author.send(botMessageContents);
            else return message.channel.send(botMessageContents);
        } catch (error) {
            console.log(error);
        }
    };
    /**
     * Send red/green `MessageEmbed`
     */
    const createResponseEmbed = async (
        send: 'send' | 'channel' | 'DM',
        type: 'invalid' | 'success',
        contents: string,
        player?: IPlayer
    ) => {
        let embed = new MessageEmbed()
            .setColor(type === 'invalid' ? 'RED' : 'GREEN')
            .setDescription(contents);
        try {
            switch (send) {
                case 'DM':
                    message.author.send(embed);
                    break;
                case 'channel':
                    message.channel.send(embed);
                default:
                case 'send':
                    channelOrDM(player, embed);
            }
        } catch (error) {
            console.error(error);
        }
    };
    /**
     * Create user wallet or full inventory
     */
    const createInventoryEmbed = (
        player: IPlayer,
        send: 'send' | 'DM',
        type?: 'wallet' | 'inventory'
    ): Promise<Message> => {
        const { lastUpdated } = player;
        const {
            gold,
            silver,
            platinum,
            electrum,
            copper,
            potions,
            weapons,
            misc
        } = player.inventory;
        const getEmbed = () => {
            switch (type) {
                case 'wallet':
                    return new MessageEmbed()
                        .setTitle(`${player.name}'s wallet`)
                        .addFields(
                            { name: 'Platinum', value: platinum, inline: true },
                            { name: 'Gold', value: gold, inline: true },
                            { name: 'Electrum', value: electrum, inline: true },
                            { name: 'Silver', value: silver, inline: true },
                            { name: 'Copper', value: copper, inline: true }
                        )
                        .setColor('#9B59B6')
                        .setFooter(`Campaign: ${player.guild}`);
                default:
                case 'inventory':
                    // add the coins together, formatted into silver
                    const money = platinum * 10 + gold + electrum / 2 + silver / 10 + copper / 100;
                    const List = (items: { name: string; quantity: number }[]) => {
                        if (!items || items.length === 0) {
                            return 'None';
                        } else {
                            return items.map((item) => {
                                return `${capitalize(item.name)} x${item.quantity}`;
                            });
                        }
                    };
                    return new MessageEmbed()
                        .setTitle(`${player.name}'s inventory`)
                        .addFields(
                            { name: 'Coins', value: `${money} gold` },
                            { name: 'Potions', value: List(potions), inline: true },
                            { name: 'Weapons', value: List(weapons), inline: true },
                            { name: 'Misc.', value: List(misc), inline: true },
                            {
                                name: 'Last updated',
                                value: moment(lastUpdated).format('MMMM Do, hh:mm a')
                            }
                        )
                        .setColor('#9B59B6')
                        .setFooter(`Campaign: ${player.guild}`);
            }
        };
        return send === 'send' ? channelOrDM(player, getEmbed()) : message.author.send(getEmbed());
    };
    return {
        userEntry: userEntry,
        coins: coins,
        channelOrDM: channelOrDM,
        createResponseEmbed: createResponseEmbed,
        createInventoryEmbed: createInventoryEmbed
    };
}
