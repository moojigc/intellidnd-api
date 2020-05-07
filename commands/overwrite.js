
function overwrite(message, args, player) {
    const { coins, userEntry, createResponseEmbed } = require('../utils/globalFunctions')(message);

    const cat = args[0];
    if (!userEntry.isValid(cat)) return createResponseEmbed('send', 'invalid', `Overwrite what? You must say, "/overwrite gold 90, /overwrite backpack rations," etc...`, player);
    
    const newItemArr = args.slice(1);
    const newItem = newItemArr.join(' ').trim();

    if (coins.isCoin(cat) && isNaN(newItem) || coins.isCoin(cat) && newItem === undefined) { // Users fails to specify an amount
        createResponseEmbed('send', 'invalid', `You didn't specify how many ${cat}.`, player);
    } else if (coins.isCoin(cat)) { // Money items
        if (newItem) createResponseEmbed('send', 'success', `${player.name} now has ${newItem} ${cat}.`, player);
        switch (cat) {
            case 'gold': 
                player.inventory.gold = parseInt(newItem);
                break;
            case 'silver':
                player.inventory.silver = parseInt(newItem);
                break;
            case 'copper': 
                player.inventory.copper = parseInt(newItem);
                break;
            case 'electrum':
                player.inventory.electrum = parseInt(newItem);
                break;
            case 'platinum':
                player.inventory.platinum = parseInt(newItem);
                break;
            default:
                let response = `You didn't specifiy an item or amount to add to ${cat}.`;
                createResponseEmbed('send', 'invalid', response, player);
        };
    } else if (!userEntry.isValid(cat)) { // Invalid entries
        createResponseEmbed('send', 'invalid', `Invalid syntax. The only valid categories are: [${validEntry.array.join(', ')}]. Type of item must come first; e.g. /overwrite gold 20, NOT /overwrite 20 gold.`, player);
    } else { // Non-money items
        const { addQuantity } = require('./add');
        switch (cat) {
            case 'potions':
            case 'potion':
                addQuantity(newItemArr, player.inventory.potions, 'overwrite');
                break;
            case 'weapons':
            case 'weapon':
                addQuantity(newItemArr, player.inventory.weapons, 'overwrite');
                break;
            case 'misc':
                addQuantity(newItemArr, player.inventory.misc, 'overwrite');
                break;
            default:
                createResponseEmbed('send', 'invalid', `You didn't specify an item or amount for ${cat}.`, player);
                break;
        }
        createResponseEmbed('send', 'success', `Overwrote ${player.name}'s ${cat} to ${newItem}.`, player);
    };
}

module.exports = overwrite;
