function add(message, args, player) {
    const { userEntry, coins, createResponseEmbed } = require('../utils/globalFunctions.js')(message);
    const cat = args[0];
    const cat2 = args[1];
    let newItemArr = args.slice(1);
    let newItem = newItemArr[0];
    let { gold, electrum, platinum, silver, copper, potions, weapons, misc } = player.inventory;
    const addCoinsTo = thisCoin => {
        let newTotal = parseInt(thisCoin) + parseInt(newItem);
        return newTotal;
    } 
    if (coins.isCoin(cat) && isNaN(cat2) || coins.isCoin(cat) && cat2 === undefined) {
        let response = `You didn't specify an amount to add to ${cat2}.`;
        createResponseEmbed('send', 'invalid', response, player);
    } else if (!userEntry.isValid(cat)) {
        let response = `Invalid syntax. The only valid categories are ${userEntry.array.join(' | ')}. 
        Type of item must come first; e.g. /add gold 20, NOT /add 20 gold.`;
        createResponseEmbed('send', 'invalid', response, player);
    } else if (coins.isCoin(cat)) {
        if (newItem) createResponseEmbed('send', 'success', `Added ${newItem} ${cat} to ${player.name}'s wallet!`, player)
        switch (cat) {
            case 'gold': 
                player.inventory.gold = addCoinsTo(gold);
                break;
            case 'silver':
                player.inventory.silver = addCoinsTo(silver);
                break;
            case 'copper': 
                player.inventory.copper = addCoinsTo(copper);
                break;
            case 'electrum':
                player.inventory.electrum = addCoinsTo(electrum);
                break;
            case 'platinum':
                player.inventory.platinum = addCoinsTo(platinum);
                break;
            default:
                let response = `You didn't specifiy an item or amount to add to ${cat}.`;
                createResponseEmbed('send', 'invalid', response, player);
        }
    } else { // Non-money items
        function addToCategory(thisCategory) { // Adds to new items
            let number;
            let thisQuantity;
            thisCategory.forEach(item => {
                if (item.name === "none") {
                    thisCategory.splice(thisCategory.indexOf(item), 1);
                }
            })

            if (newItem.includes(",")) { // Case that user adds a list of items
                let itemsList = newItem.split(', ');
                itemsList.forEach(item => {
                        let itemMap = {
                            name: item.trim(),
                            quantity: 1
                        }
                        thisCategory.push(itemMap);
                })
            } else { // Case that user adds single item
                newItemArr.forEach(item => {
                    if (!isNaN(item)) {
                        number = item;
                    }
                })
                if (!number) { // Case that no quantity specified
                    newItemMap = {
                        name: newItem.trim(),
                        quantity: 1
                    }
                    thisCategory.push(newItemMap);
                } else { // Case that quantity is specified
                    thisQuantity = newItemArr.splice(newItemArr.indexOf(number), 1);
                    let thisItemName = newItemArr.join(' '); 
                    let thisItemMap = {
                        name: thisItemName,
                        quantity: parseInt(thisQuantity)
                    }
                    let foundExisiting = false;
                    thisCategory.forEach(item => {
                        if (item.name === thisItemName) {
                            foundExisiting = true;
                            item.quantity = parseInt(item.quantity) + parseInt(thisQuantity);
                        } else {
                            return;
                        }
                    }); 
                    if(foundExisiting === false) thisCategory.push(thisItemMap);
                }
            }
        }
        switch (cat) {
            case 'potion':
            case 'potions':
                addToCategory(potions);
                break;
            case 'weapon':
            case 'weapons':
                addToCategory(weapons);
                break;
            case 'misc': 
                addToCategory(misc);
                break;
            default:
                let response = `Add what? You must say, "/add gold 90, /add backpack rations," etc...`;
                createResponseEmbed('send', 'invalid', response, player)
        }
    }
    console.log(player);
    return player;
}

module.exports = add;