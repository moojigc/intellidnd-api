function removeItem(message, args, player) {
    const { userEntry, coins, createResponseEmbed } = require('../utils/globalFunctions.js')(message);
    let foundExisiting = false;
    const cat = args[0];
    let removedItemArr = args.slice(1);
    let removedItem = removedItemArr[0];
    let { gold, electrum, platinum, silver, copper, potions, weapons, misc } = player.inventory;

    const errorMessage = "Remove what? Must specify /remove gold 10, /remove weapon staff, etc...";
    if (!cat) return createResponseEmbed('send', 'invalid', errorMessage, player);

    // Users fails to specify an amount
    if (coins.isCoin(cat) && isNaN(removedItem) || coins.isCoin(cat) && removedItem === undefined) { 
        createResponseEmbed('send', 'invalid', `You didn't specify an amount of ${cat} to remove.`);
    } else if (coins.isCoin(cat)) {
        const removeCoins = thisCoin => {
            console.log(thisCoin);
            let newAmount = parseInt(thisCoin) - parseInt(removedItem);
            if (newAmount < 0) {
                createResponseEmbed('send', 'invalid', `You don't have enough ${cat}!`, player);
                return thisCoin;
            } 
            else {
                createResponseEmbed('send', 'success', `Removed ${removedItem} ${cat} from *${player.name}'s* wallet.`, player);
                return newAmount;
            }
        };
        switch (cat) {
            case 'gold': 
                player.inventory.gold = removeCoins(gold);
                break;
            case 'silver':
                player.inventory.silver = removeCoins(silver);
                break;
            case 'copper': 
                player.inventory.copper = removeCoins(copper);
                break;
            case 'electrum':
                player.inventory.electrum = removeCoins(electrum);
                break;
            case 'platinum':
                player.inventory.platinum = removeCoins(platinum);
                break;
            default:
                let response = `You didn't specifiy an item or amount to remove from ${cat}.`;
                createResponseEmbed('send', 'invalid', response, player);
        }
    } else if (userEntry.isValid(cat) && removedItem === undefined) { // No item specified
        createResponseEmbed('send', 'invalid', `You didn't specify an item to remove from *${cat}*.`, player);
    } else { // Non-money items
        function removeFromCategory(thisCategory) {
            let number;
            let thisQuantity;
            
            removedItemArr.forEach(item => {
                if (!isNaN(item)) {
                    number = item;
                }
            })
            if (!number) { // Case that no quantity specified
                thisCategory.forEach(item => {
                    if (item.name.toLowerCase() === removedItem.trim().toLowerCase()) {
                        thisCategory.splice(thisCategory.indexOf(item), 1);
                        foundExisiting = true;
                    }
                })
            } else { // Case that quantity is specified
                thisQuantity = removedItemArr.splice(removedItemArr.indexOf(number), 1);
                let thisItemName = removedItemArr.join(' '); 
                
                thisCategory.forEach(item => {
                    if (item.name.toLowerCase() === thisItemName.toLowerCase()) {
                        foundExisiting = true;
                        item.quantity = parseInt(item.quantity) - parseInt(thisQuantity);
                    } else {
                        return;
                    }
                }); 
            }
            if (thisCategory.length < 1) {
                let emptyMap = {
                    name: 'none',
                    quantity: 0
                };
                thisCategory.push(emptyMap);
            }
            // Check if that player had removedItem in inventory at all
            if (foundExisiting === false) {
                createResponseEmbed('send', 'invalid', `No such item found in ${cat}.`, player);
            } else {
                createResponseEmbed('send', 'success', `Removed ${number} ${removedItem} from ${player.name}'s ${cat}.`, player);
            }
        }
        // Calling removal on each category
        switch (cat) {
            case 'potion':
            case 'potions':
                removeFromCategory(potions);
                break;
            case 'weapon':
            case 'weapons':
                removeFromCategory(weapons);
                break;
            case 'misc':
                removeFromCategory(misc);
                break;
        };
    } 
    return player;
}

module.exports = removeItem;
