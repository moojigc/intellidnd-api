const fs = require('fs');
const inventoryDataDir = './inventory.json';
const inventoryData = require(inventoryDataDir);

const Discord = require('discord.js');
const moment = require('moment');
const { prefix, token } = require('./config.json');
const client = new Discord.Client({disableMentions: 'everyone'});

client.once('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    
    try {
        let link = await client.generateInvite(['ADMINISTRATOR']);
        console.log(link);
    } catch(e) {
        console.log(e.stack);
    }
});

client.on('message', async message => {
    if(message.author.bot) return; // Stops function if user is a bot
    if(message.channel.type === 'dm') return;

    let messageArr = message.content.split(" ");
    let command = messageArr[0];
    let args = messageArr.slice(1)[0];
    let toShow = message.member.displayName;

    // let toShow; 
    //     if (message.guild.member(message.mentions) === null) {
    //         toShow = message.member.displayName;
    //     } else {
    //         toShow = message.guild.member(message.mentions.members.first().displayName);
    //     }
    if(!command.startsWith(prefix)) return;
    function writeToJSON() {
        fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
            console.log(`writing to ${inventoryDataDir}`);
        });
    }
    function writeChangelog() {
        let change = {
            on: moment().format('hh:mm a, on MMMM Do, YYYY'),
            command: message.content,
        }
        if (thisPlayer.changelog.length > 9) {
            thisPlayer.changelog.shift();
            thisPlayer.changelog.push(change);
        } else {
            thisPlayer.changelog.push(change);
        }
    }

    let thisPlayer;
    let thisPlayerInv;
    function getPlayerData(victimPlayer) { // Equate the displayName with the playerName holding the data
        inventoryData.players.forEach(player => {
            if (victimPlayer === player.name) {
                thisPlayer = player;
                thisPlayerInv = player.inventory;
            }
        });

        if(!thisPlayer) {
            if(command === `${prefix}/create`) {
                return;
            } else {
                createResponseEmbed('channel', 'invalid', "No player was found. Create an inventory using /create myinventory or /create @[username].");
            }
        }
        // console.log(`プレヤー発見！ あなたは${inventoryData.campaignName}の${thisPlayer.name}という冒険者です！`);
    }
    function channelOrDM(botMessageContents) { // sends message to either channel or DMs
        if (thisPlayer.notificationsToDM === true) {
            message.author.send(botMessageContents);
        } else {
            message.channel.send(botMessageContents);
        }
    }

    function createInventoryEmbed(send, type) {
        // Create user wallet or full inventory
        let embed;
        if (type === 'wallet') {         
            embed = new Discord.MessageEmbed()
                .setTitle(`${thisPlayer.name}'s wallet`)
                .addFields(
                    { name: 'Platinum', value: thisPlayerInv.platinum, inline: true },
                    { name: 'Gold', value: thisPlayerInv.gold, inline: true },
                    { name: 'Electrum', value: thisPlayerInv.electrum, inline: true },
                    { name: 'Silver', value: thisPlayerInv.silver, inline: true },
                    { name: 'Copper', value: thisPlayerInv.copper, inline: true }
                )
                .setColor("#9B59B6")
                .setFooter(`Campaign: ${message.guild.name}`);
        } else {
            // add the coins together, formatted into silver
            let money = parseInt(thisPlayerInv.platinum)*10 + parseInt(thisPlayerInv.gold) + parseInt(thisPlayerInv.electrum)/2 + parseInt(thisPlayerInv.silver)/10 + parseInt(thisPlayerInv.copper)/100;

            embed = new Discord.MessageEmbed()
                .setTitle(`${thisPlayer.name}'s inventory`)
                .addFields(
                    { name: 'Coins', value: `${money} gold` },
                    { name: 'Potions', value: thisPlayerInv.potions, inline: true },
                    { name: 'Weapons', value: thisPlayerInv.weapons, inline: true },
                    { name: 'Misc.', value: thisPlayerInv.misc, inline: true },
                    { name: 'Last updated', value: thisPlayerInv.lastUpdated }
                )
                .setColor("#9B59B6")
                .setFooter(`Campaign: ${message.guild.name}`);
        };  
        if (send === "send") {
            channelOrDM(embed);
        } else if (send === "DM") {
            message.author.send(embed);
        }
    }
    function createResponseEmbed(send, type, contents) {
        let embed;
        if (type === 'invalid') {
            embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(contents);
        } else if (type === 'success') {
            embed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setDescription(contents);
        }
        if (send === "send") {
            channelOrDM(embed);
        } else if (send === "DM") {
            message.author.send(embed);
        } else if (send === "channel") {
            message.channel.send(embed);
        }
    }


    let cat = messageArr.slice(1)[0];
    let cat2 = messageArr.slice(1)[1]; // Additional category options
    let newItemArr = messageArr.slice(2);
    let newItem = newItemArr.join(' ');  
    let removedItemArr = messageArr.slice(2);
    let removedItem = removedItemArr.join(' ');  
    let victimPlayer = message.member.displayName;
    getPlayerData(victimPlayer);
    literallyEverything(thisPlayer, thisPlayerInv, cat, cat2, newItem, removedItem);

    function literallyEverything(thisPlayer, thisPlayerInv, cat, cat2, newItem, removedItem) { // Contains literally all the commands.
        try {
            var validEntry = {
                array: ['gold','silver','electrum','platinum','copper','potions','potion','weapons','weapon','backpack','misc'],
                true: function() {
                    if (this.array.includes(cat)) {
                        return true;
                    } else {
                        return false;
                    }
                },
            };
            var coins = {
                array: ['gold','silver','electrum','platinum','copper'],
                true: function() {
                    if (this.array.includes(cat)) {
                        return true;
                    } else {
                        return false;
                    }
                },
            };
            if (message.content.includes(prefix)) console.log(command);
            // Show inventory.
            if(command === `${prefix}inventory`) {
                if (cat === "everyone") {
                    inventoryData.players.forEach(player => {
                        thisPlayer = player;
                        thisPlayerInv = player.inventory;
                        createInventoryEmbed('DM');
                    });
                } else {
                    // getPlayerData();
                    createInventoryEmbed('send');
                }
            }
            // End of /inventory command
            else if(command === `${prefix}wallet`) {
                if (cat === "everyone") {
                    inventoryData.players.forEach(player => {
                        thisPlayer = player;
                        thisPlayerInv = player.inventory;
                        createInventoryEmbed('DM', 'wallet');
                    });
                } else {
                    // getPlayerData();
                    createInventoryEmbed('send', 'wallet');
                }
            }
            else if(command === `${prefix}add`) {
                let cat2 = messageArr.slice(1)[1]; // Additional category options
                let newItemArr = messageArr.slice(2);
                let newItem = newItemArr.join(' ');  
                // getPlayerData();
     
                if (cat !== undefined) {
                    if (coins.true() && isNaN(cat2) || coins.true() && cat2 === undefined) { // Users fails to specify an amount
                        createResponseEmbed('send', 'invalid', `You didn't specify an amount to add to ${cat}.`);
                    } else if (coins.true()) { // Money items
                        function addCoins(thisCoin) {
                            if (thisCoin === null) thisPlayerInv.gold = 0;
                            let newTotal = parseInt(thisCoin) + parseInt(newItem);
                            return newTotal;
                        }
                        if (cat === "gold") {
                            thisPlayerInv.gold = addCoins(thisPlayerInv.gold);
    
                        } else if (cat === "silver") {
                            thisPlayerInv.silver = addCoins(thisPlayerInv.silver);
    
                        } else if (cat === "electrum") {
                            thisPlayerInv.electrum = addCoins(thisPlayerInv.electrum);
    
                        } else if (cat === "platinum") {
                            thisPlayerInv.platinum = addCoins(thisPlayerInv.platinum);
    
                        } else if (cat === "copper") {
                            thisPlayerInv.copper = addCoins(thisPlayerInv.copper);
    
                        } // End of money items
                        writeChangelog();
                        createResponseEmbed('send', 'success', `Added ${newItem} ${cat} to ${thisPlayer.name}'s wallet.`);
                    } 
                    else if (validEntry.true() === false) { // Invalid entries
                        createResponseEmbed('send', 'invalid', `Invalid syntax. The only valid categories are: [${validEntry.array.join(', ')}]. Type of item must come first; e.g. /add gold 20, NOT /add 20 gold.`);
                    } 
                    else if (validEntry.true() && cat2 === undefined) { // No item specified
                        createResponseEmbed('send', 'invalid', `You didn't specifiy an item or amount to add to ${cat}.`);
                    } 
                    else { // Non-money items
                        function addToCategory(thisCategory) { // Adds to new items
                            if (thisCategory.includes("none")) thisCategory.shift();
                            
                            if (newItem.includes(",")) {
                                let itemsList = newItem.split(',');
                                itemsList.forEach(item => thisCategory.push(item.trim()));
                            } else {
                                let number;
                                let thisQuantity;
                                newItemArr.forEach(item => {
                                    if (!isNaN(item)) {
                                        number = item;
                                    }
                                })
                                if (!number) {
                                    thisCategory.push(newItem.trim());
                                } else {
                                    console.log(newItemArr.indexOf(number));
                                    thisQuantity = newItemArr.splice(newItemArr.indexOf(number));
                                    let thisItemName = newItemArr.join(' ');
                                    thisCategory.push(`${thisItemName} x${thisQuantity}`);
                                    console.log(newItemArr, thisItemName, thisQuantity);
                                }
                            }
                        }
                        if (cat === "potions" || cat === "potion") {            
                            addToCategory(thisPlayerInv.potions);
                        } else if (cat === "weapons" || cat === "weapon") {
                            addToCategory(thisPlayerInv.weapons);
                        } else if (cat === "misc") {
                            addToCategory(thisPlayerInv.misc);
                        }; 
                        createResponseEmbed('send', 'success', `Added ${newItem} to ${thisPlayer.name}'s ${cat}.`);
                    } 
                    thisPlayerInv.lastUpdated = moment().format('MMMM Do, hh:mm a');
                    writeToJSON();
                } else if (validEntry.true() && newItem === null || cat === undefined) {
                    createResponseEmbed('send', 'invalid', `Add what? You must say, "/add gold 90, /add backpack rations," etc...`)
                }
            }
            // End of /add command
            else if(command === `${prefix}remove`) {
                // getPlayerData();
                if (cat !== undefined) {
                    if (coins.true() && isNaN(cat2) || coins.true() && cat2 === undefined) { // Users fails to specify an amount
                        createResponseEmbed('send', 'invalid', `You didn't specify an amount of ${cat} to remove.`);
                    } else if (coins.true()) {
                        function removeCoins(thisCoin) {
                            console.log(thisCoin);
                            let newAmount = parseInt(thisCoin) - parseInt(removedItem);
                            return newAmount;
                        };
                        if (cat === "gold") {
                            thisPlayerInv.gold = removeCoins(thisPlayerInv.gold);
                        } else if (cat === "silver") {
                            thisPlayerInv.silver = removeCoins(thisPlayerInv.silver);
                        } else if (cat === "platinum") {
                            thisPlayerInv.platinum = removeCoins(thisPlayerInv.platinum);
                        } else if (cat === "electrum") {
                            thisPlayerInv.electrum = removeCoins(thisPlayerInv.electrum);
                        } else if (cat === "copper") {
                            thisPlayerInv.copper = removeCoins(thisPlayerInv.copper);
                        }
                        createResponseEmbed('send', 'success', `Removed ${removedItem} ${cat} from ${thisPlayer.name}'s wallet.`);
                    } 
                    else if (validEntry.true() && cat2 === undefined) { // No item specified
                        createResponseEmbed('send', 'invalid', `You didn't specify an item to remove from ${cat}.`);
                    } 
                    else { // Non-money items
                        if (cat === "potions") {
                            let playerCategory = thisPlayerInv.potions;
                            if (removedItem.includes(',')) {
                                let removedItemsList = removedItem.split(',');
                                removedItemsList.forEach(item => {
                                    for(var i=0; playerCategory.length; i++) {
                                        if (playerCategory[i] === item.trim()) {
                                            playerCategory.splice(playerCategory.indexOf(item.trim()));
                                        }
                                    }
                                });
                        
                            } else {
                                playerCategory.splice(playerCategory.indexOf(removedItem));
                            }
    
                            if(playerCategory.length < 1) playerCategory.push("none");
                        } else if (cat === "weapons") {
                            let playerCategory = thisPlayerInv.weapons;
                            if (removedItem.includes(',')) {
                                let removedItemsList = removedItem.split(',');
                                removedItemsList.forEach(item => {
                                    for(var i=0; playerCategory.length; i++) {
                                        if (playerCategory[i] === item.trim()) {
                                            playerCategory.splice(playerCategory.indexOf(item.trim()));
                                        }
                                    }
                                });
                        
                            } else {
                                playerCategory.splice(playerCategory.indexOf(removedItem));
                            }
    
                            if(playerCategory.length < 1) playerCategory.push("none");
                        } else if (cat === "misc") {
                            let playerCategory = thisPlayerInv.misc;
                            if (removedItem.includes(',')) {
                                let removedItemsList = removedItem.split(',');
                                removedItemsList.forEach(item => {
                                    for(var i=0; playerCategory.length; i++) {
                                        if (playerCategory[i] === item.trim()) {
                                            playerCategory.splice(playerCategory.indexOf(item.trim()));
                                        }
                                    }
                                });
                        
                            } else {
                                playerCategory.splice(playerCategory.indexOf(removedItem));
                            }
    
                            if(playerCategory.length < 1) playerCategory.push("none");
                        } 
                        createResponseEmbed('send', 'success', `Removed ${removedItem} from ${thisPlayer.name}'s ${cat}.`);
                    } 
                    thisPlayerInv.lastUpdated = moment().format('MMMM Do, hh:mm a');
                    writeToJSON();
                } else if (!isNaN(cat)) {
                    function removeByQuantity() {
    
                    }
                }
                else {
                    createResponseEmbed('send', 'invalid', "Remove what? Must specify /remove gold 10, /remove weapon staff, etc...");
                }
            }
            else if(command === `${prefix}overwrite`) {
                // getPlayerData();
                if (cat !== undefined) {
                    if (coins.true() && isNaN(cat2) || coins.true() && cat2 === undefined) { // Users fails to specify an amount
                        createResponseEmbed('send', 'invalid', `You didn't specify how many ${cat}.`);
                    } else if (coins.true()) { // Money items
                        if (cat === "gold") {
                            thisPlayerInv.gold = parseInt(newItem);
    
                        } else if (cat === "silver") {
                            thisPlayerInv.silver = parseInt(newItem);
    
                        } else if (cat === "electrum") {
                            thisPlayerInv.electrum = parseInt(newItem);
    
                        } else if (cat === "platinum") {
                            thisPlayerInv.platinum = parseInt(newItem);
    
                        } else if (cat === "copper") {
                            thisPlayerInv.copper = parseInt(newItem);
    
                        } // End of money items
                        createResponseEmbed('send', 'success', `${thisPlayer.name} now has ${newItem} ${cat}.`);
                    } 
                    else if (validEntry.true() === false) { // Invalid entries
                        createResponseEmbed('send', 'invalid', `Invalid syntax. The only valid categories are: [${validEntry.array.join(', ')}]. Type of item must come first; e.g. /overwrite gold 20, NOT /overwrite 20 gold.`);
                    } 
                    else if (validEntry.true() && cat2 === undefined) { // No item specified
                        createResponseEmbed('send', 'invalid', `You didn't specify an item or amount for ${cat}.`);
                    } 
                    else { // Non-money items
                        if (cat === "potions" || cat === "potion") {            
                            thisPlayerInv.potions = newItem;
                        } else if (cat === "weapons" || cat === "weapon") {
                            thisPlayerInv.weapons = newItem;
                        } else if (cat === "misc") {
                            thisPlayerInv.misc = newItem;
                        }; 
                        createResponseEmbed('send', 'success', `Overwrote ${thisPlayer.name}'s ${cat} to ${newItem}.`);
                    } 
                    thisPlayerInv.lastUpdated = moment().format('MMMM Do, hh:mm a');
                    writeToJSON();
                } else if (validEntry.true() && newItem === null || cat === undefined) {
                    createResponseEmbed('send', 'invalid', `Overwrite what? You must say, "/overwrite gold 90, /overwrite backpack rations," etc...`)
                }
            }
            // End of /remove command
            else if(command === `${prefix}create`) {
                function createNewPlayer(prepack, goldCoins, silverCoins, DMsetting) {
                    let newPlayer;
                    if (prepack === 'prepack') {
                        newPlayer = {
                            name: toShow,
                            notificationsToDM: false,
                            inventory: {
                                gold: parseInt(goldCoins),
                                silver: parseInt(silverCoins),
                                copper: 0,
                                platinum: 0,
                                electrum: 0,
                                potions: ["none"],
                                weapons: ["none"],
                                misc: [
                                    "crowbar",
                                    "hammer",
                                    "pitons x10",
                                    "torches x10",
                                    "rations x10",
                                    "feet of hempen rope x100"
                                ],
                                lastUpdated: moment().format("MMMM Do, hh:mm a")
                            },
                            changelog: [{
                                on: moment().format("DD/MM/YYYY, hh:mm a"),
                                command: message.content,
                            }]
                        }
                        if (DMsetting === "DM") newPlayer.notificationsToDM = true;
                    } else {
                        newPlayer = {
                            'name': toShow,
                            'notificationsToDM': false,
                            'inventory': {
                                gold: 0,
                                silver: 0,
                                copper: 0,
                                platinum: 0,
                                electrum: 0,
                                potions: ["none"],
                                weapons: ["none"],
                                misc: ["none"],
                                lastUpdated: moment().format("MMMM Do, hh:mm a")
                            },
                            changelog: [{
                                on: moment().format("DD/MM/YYYY, hh:mm a"),
                                command: message.content,
                            }]
                        }
                    }
                    return newPlayer;
                } 
                inventoryData.players.forEach(player => {
                    if (toShow === player.name) {
                        thisPlayer = player;
                        thisPlayerInv = player.inventory;
                    }
                });
                if (thisPlayer) { 
                    return message.channel.send("This user already has an inventory set up!");
                } else {
                    let userDMSetting = messageArr.slice(2)[0];
                    let userGoldCoins = messageArr.slice(2)[1];
                    let userSilverCoins = messageArr.slice(2)[2];
                    if (cat === 'prepack') {
                        inventoryData.players.push(createNewPlayer('prepack', userDMSetting, userGoldCoins, userSilverCoins));
                    } else {
                        inventoryData.players.push(createNewPlayer()); 
                    }
                    inventoryData.campaignName = message.guild.name;
                    // Write to inventory.json
                    writeToJSON();
                };
            }
            // End of /create command
            else if(command === `${prefix}helpinventory`) {
                let helpEmbed = new Discord.MessageEmbed()
                    .setTitle('DnD Inventory Bot Guide')
                    .addFields(
                        { name: '/inventory', value: `Displays your own inventory. Adding a category
                        plus a value (e.g. /inventory gold 100) will update your inventory.` },
                        { name: '/inventory @member', value: `Only allowed to anyone with kick/ban permissions. This command works the same as the regular /inventory one.`},
                        { name: '/create', value: `This command creates your inventory and all fields will be empty or 0 by default.
                        This bot uses nicknames as the player names, not the user's regular Discord username.` },
                        { name: '/create @member', value: `This command allowed only to anyone with kick/ban permission.
                        Creates an empty inventory for the specified user. `},
                        { name: '/overwrite', value: `This command overwrites EVERYTHING in the specified category. For example, "/overwrite weapons Sword"
                        will delete all your weapons and set the Sword as your only weapon. Use with care.`},
                        { name: 'Money', value: `When dealing with money, there are 3 possible commands. 
                        "/overwrite gold 50" will overwrite any previous amount and hardcode your current gold to 50.
                        "/add gold 50" will add to the current amount.
                        "/remove gold 50" will subtract from the current amount.`},
                        { name: 'Support', value: `If you find a bug or have any suggestions for additional features, please submit a ticket at https://github.com/moojigc/DiscordBot/issues.`},
                    )
                    .setURL('https://github.com/moojigc/DiscordBot/')
                    .setColor("#9B59B6")
                    .setFooter('Both author: Moojig Battsogt');
                message.channel.send(helpEmbed);
            }
            // End of /helpinventory command
            else if (command === `${prefix}dm`) {
                if (cat === 'on') {
                    // getPlayerData();
                    thisPlayer.notificationsToDM = true;
                    createResponseEmbed('send', 'success', 'You will now receive all confirmations via DMs only.');
                    writeToJSON();
                } else if (cat === 'off') {
                    // getPlayerData();
                    thisPlayer.notificationsToDM = false;
                    createResponseEmbed('send', 'success', 'I will now send you updates within the channel.')
                    writeToJSON();
                }
            }
            // End of /dm command
            else if (command === `${prefix}deleteme`) {
                // getPlayerData();
                inventoryData.players.splice(inventoryData.players.indexOf(thisPlayer), 1);
                createResponseEmbed('channel', 'success', `Player ${toShow}'s inventory successfully deleted.`)
                writeToJSON();
            }
            // End of /deleteme command
            else if (command === `${prefix}changelog`) {
                let readableLog = [];
                thisPlayer.changelog.forEach(change => {
                    readableLog.push(`Ran ${change.command} on ${change.on}.`)
                })
                message.author.send(readableLog.join(`
                `));
            }
        } catch(e) {
            console.log(e.stack);
            let errorEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`Something went wrong!`)
                .setDescription(`Hi ${message.author.username}, 
                You tried to execute: ${message} but it returned the following error.`)
                .addField('Problem:', `${e}.
                If you did not get any other error messages, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`)
                .addField('At:', moment().format('MMMM Do, hh:mm a'));
    
            message.author.send(errorEmbed);
        }
    }
}); // End of script

client.login(token);