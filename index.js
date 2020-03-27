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
    let cat = messageArr.slice(1)[0];

    let toShow = message.member.displayName;
    console.log(`this is ${toShow}.`);

    // inventory items
    let platinum;
    let gold;
    let electrum;
    let silver;
    let copper;
    let potions;
    let weapons;
    let backpack;
    let allOtherItems;
    let lastUpdated;

    if(!command.startsWith(prefix)) return;

    try {
        function writeToJSON() {
            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            });
        } 

        var thisPlayer;
        function getPlayerData() { // Equate the displayName with the playerName holding the data
            inventoryData.players.forEach(player => {
                if (toShow === player.name) {
                    thisPlayer = player;
                    thisPlayerInv = player.inventory;
                }
            });

            if(!thisPlayer) {
                console.log("No player found.");
                message.channel.send("No player was found. Create an inventory using /create myinventory or /create @[username].");
            }
            console.log(`You are ${thisPlayer.name} of ${inventoryData.campaignName}.`);
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
                let money = parseInt(thisPlayerInv.platinum)*100 + parseInt(thisPlayerInv.gold)*10 + parseInt(thisPlayerInv.electrum)*5 + (parseInt(thisPlayerInv.silver)) + parseInt(thisPlayerInv.copper)/10;

                embed = new Discord.MessageEmbed()
                    .setTitle(`${thisPlayer.name}'s inventory`)
                    .addFields(
                        { name: 'Coins', value: `${money} silver` },
                        { name: 'Potions', value: thisPlayerInv.potions, inline: true },
                        { name: 'Weapons', value: thisPlayerInv.weapons, inline: true },
                        { name: 'Backpack', value: thisPlayerInv.backpack, inline: true },
                        { name: 'Misc.', value: thisPlayerInv.allOtherItems, inline: true },
                        { name: 'Last updated', value: thisPlayerInv.lastUpdated }
                    )
                    .setColor("#9B59B6")
                    .setFooter(`Campaign: ${message.guild.name}`);
            };  
            if (send === "send") message.channel.send(embed);
        }

        // Show inventory.
        if(command === `${prefix}inventory`) {
            let cat2 = messageArr.slice(1)[1]; // Additional category options
            let newItemArr = messageArr.slice(2);
            let newItem = newItemArr.join(' ');  
            
            getPlayerData();

            // Write to inventory.json
            // writeToJSON();

            createInventoryEmbed('send');
        }
        // End of /inventory command

        if(command === `${prefix}inventory ${cat}`) {
            if (cat.length > 0) {
                if (cat === "gold") {
                    thisPlayerInv.gold = newItem;
                    console.log(`Category: ${cat}. User input: ${newItemArr}. New item: ${newItem}. Current ${cat} is ${thisPlayerInv.gold}.`);
                } else if (cat === "silver") {
                    thisPlayerInv.silver = newItem;
                } else if (cat === "electrum") {
                    thisPlayerInv.electrum = newItem;
                } else if (cat === "platinum") {
                    thisPlayerInv.platinum = newItem;
                } else if (cat === "copper") {
                    thisPlayerInv.copper = newItem;
                } 
                // Non-money items
                else if (cat === "potions") {
                    thisPlayerInv.potions.push(newItem);
                    if (thisPlayerInv.potions.includes("none")) thisPlayerInv.potions.shift();
                } else if (cat === "weapons") {
                    thisPlayerInv.weapons.push(newItem);
                    if (thisPlayerInv.weapons.includes("none")) thisPlayerInv.weapons.shift();
                } else if (cat === "backpack") {
                    thisPlayerInv.backpack.push(newItem);
                    if (thisPlayerInv.backpack.includes("none")) thisPlayerInv.backpack.shift();
                } else if (cat === "misc") {
                    thisPlayerInv.allOtherItems.push(newItem);
                    if (thisPlayerInv.allOtherItems.includes("none")) thisPlayerInv.allOtherItems.shift();
                } 
                thisPlayerInv.lastUpdated = moment().format('MMMM Do, hh:mm a');
                writeToJSON();
            }
        }

        if(command === `${prefix}create`) {
            let toShow = message.member.displayName;
            
            // Write to inventory.json
            writeToJSON();
            
            // Equate the displayName with the playerName holding the data
            var thisPlayer;
            inventoryData.players.forEach(player => {
                if (toShow === player.name) {
                    // Looks for matching username and sets that user to thisPlayer
                    thisPlayer = player;
                } else {
                    console.log("No player found.");
                    message.channel.send("No player was found. Create an inventory using /create myinventory or /create @[username].");
                }
            });

        } 
        if(command === `${prefix}help`) {
            let helpEmbed = new Discord.MessageEmbed()
                .setTitle('Inventory Bot Guide')
                .addFields(
                    { name: '/inventory, /inventory @member', value: `Displays your own inventory. Adding a category
                    plus a value (e.g. /inventory gold 100) will update your inventory. 
                    "/inventory remove [category] [item] will remove that item. All changes are permanent.
                    "/inventory @member is only allowed to the DM/anyone with kick/ban permissions. This command works the same as the regular /inventory one.`},
                    { name: 'Money', value: `When dealing with money, there are 3 possible commands. 
                    "/inventory gold 50" will overwrite any previous amount and hardcode your current gold to 50.
                    "/inventory gold add 50" will add to the current amount.
                    "/inventory gold minus 50" will subtract from the current amount.`},
                    { name: '/create myinventory', value: `This command creates your inventory and all fields will be empty or 0 by default.
                    This bot uses nicknames as the player names, not the user's regular Discord username.` },
                    { name: '/create @member', value: `This command allowed only to the DM/anyone with kick/ban permission.
                    Creates an empty inventory for the specified user. `},
                )

                .setColor("#9B59B6")
                .setFooter('Both author: Moojig Battsogt');
            message.channel.send(helpEmbed);
        }

    } catch(e) {
        console.log(e.stack);
    }
}); // End of script

client.login(token);