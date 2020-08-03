import { Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';

import { Item } from './index';
import utils from '../utils';
/**
 * Remove items or coins
 */
export default async function removeItem(message: Message, args: string[], player: IPlayer) {
    const { userEntry, coins, createResponseEmbed } = utils(
            message
        ),
        [cat] = args,
        removedItemArr = args.slice(1),
        [removedItem] = removedItemArr;
    if (!cat) {
        // End script here if no category specified
        createResponseEmbed(
            'send',
            'invalid',
            'Remove what? Must specify /remove gold 10, /remove weapon staff, etc...',
            player
        );
        return player;
    } else if ((coins.isCoin(cat) && isNaN(Number(removedItem))) || (coins.isCoin(cat) && !removedItem)) {
        // Users fails to specify an amount
        createResponseEmbed(
            'send',
            'invalid',
            `You didn't specify an amount of ${cat} to remove.`,
            player
        );
    } else if (coins.isCoin(cat)) {
        const removeCoins = (thisCoin) => {
            let newAmount = parseInt(thisCoin) - parseInt(removedItem);
            if (newAmount < 0) {
                createResponseEmbed('send', 'invalid', `You don't have enough ${cat}!`, player);
                return thisCoin;
            } else {
                createResponseEmbed(
                    'send',
                    'success',
                    `Removed ${removedItem} ${cat} from *${player.name}'s* wallet.`,
                    player
                );
                return newAmount;
            }
        };
        if (!removedItem) {
            createResponseEmbed('send', 'invalid', `Remove how much ${cat}?`, player);
        } else {
            player.inventory[cat] = removeCoins(player.inventory[cat]);
        }
    } else if (userEntry.isValid(cat) && removedItem === undefined) {
        // No item specified
        createResponseEmbed(
            'send',
            'invalid',
            `You didn't specify an item to remove from *${cat}*.`,
            player
        );
    } else {
        // Non-money items
        const removeFromCategory = (thisCategory, inputString) => {
            // Split up input into arrays separated by any commas
            let inputArr = inputString.split(',').map((item) => item.trim());
            let oldCategory = thisCategory
                .slice()
                .map((item) => new Item(item.name, parseInt(item.quantity)));
            // Map all input, separated by commas, to new Item objects
            const removedItemMap = inputArr
                .map((input) => {
                    let [name] = input.split(' ').filter((item) => isNaN(item));
                    let [quantity] = input.split(' ').filter((item) => !isNaN(item));
                    if (!quantity) return new Item(name, NaN);
                    else return new Item(name, parseInt(quantity));
                })
                .filter((item) => !!item);

            // Check against existing objects
            let changedBoolean = false;
            let remaining = oldCategory
                .map((old) => {
                    // For every index of oldCategory, check its .name property against each item in removedItemMap
                    let matches = removedItemMap.filter((removed) => removed.name === old.name);
                    // Return old if no matches found
                    if (matches.length === 0) return old;
                    else {
                        changedBoolean = true;
                        let [reducedItem] = matches.map((match) => {
                            return old.removeQuantity(match.quantity);
                        });
                        // If item quantity is now zero (or null), i.e. totally gone, return null
                        if (reducedItem.quantity === 0 || isNaN(reducedItem.quantity)) return null;
                        else return reducedItem;
                    }
                })
                .filter((item) => !!item);

            if (remaining.length === oldCategory.length && !changedBoolean) {
                createResponseEmbed(
                    'send',
                    'invalid',
                    `Error: *${removedItemArr.join(
                        ' '
                    )}* not found in ${cat}. Check spelling if your input should have matched an item.`,
                    player
                );
                return oldCategory;
            } else if (remaining.length === 0) {
                return null;
            } else {
                return remaining;
            }
        };
        // Calling removal on each category
        if (!userEntry.isValid(cat)) {
            createResponseEmbed(
                'send',
                'invalid',
                `The only valid categories are ${userEntry.array.join(', ')}.`,
                player
            );
        } else if (!removedItem) {
            createResponseEmbed('send', 'invalid', `Remove what from ${cat}?`, player);
        } else {
            createResponseEmbed(
                'send',
                'success',
                `Removed **${removedItem}** from *${player.name}'s* ${cat}.`,
                player
            );
            player.inventory[cat] = removeFromCategory(
                player.inventory[cat],
                removedItemArr.join(' ')
            );
            await player.updateOne({
                inventory: player.inventory,
                lastUpdated: Date.now(),
                changelog: player.writeChangelog(message.content)
            });
        }
    }
    return player;
}