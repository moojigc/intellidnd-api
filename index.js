use: 'strict';

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
    let command = messageArr[0].toLowerCase();

    if(!command.startsWith(prefix)) return;

    try {
        let sender = message.author;
        // let toShow = message.mentions.members.first().displayName || message.member.displayName;
        let toShow = message.member.displayName;
        
        let thisPlayer;
        
        // Equate the displayName with the playerName holding the data
        inventoryData.players.forEach(player => {
            if (toShow === player.name) {
                thisPlayer = player;
            } else {
                console.log("No player found.");
                message.channel.send("This user does not have an inventory set up.")
            }
        });
        if (thisPlayer === undefined) return message.channel.send("No player found.");

        // create embed
        async function createInventoryEmbed(thisPlayer, send, type) {
            // Create user wallet or full inventory
            let embed;
            if (type === 'wallet') {         
                console.log(thisPlayer.inventory);
                embed = await new Discord.MessageEmbed()
                    .setTitle(`${thisPlayer.name}'s wallet`)
                    .addFields(
                        { name: 'Platinum', value: thisPlayer.inventory.thisPlayer.inventory.platinum, inline: true },
                        { name: 'Gold', value: thisPlayer.inventory.gold, inline: true },
                        { name: 'Electrum', value: thisPlayer.inventory.electrum, inline: true },
                        { name: 'Silver', value: thisPlayer.inventory.silver, inline: true },
                        { name: 'Copper', value: thisPlayer.inventory.copper, inline: true }
                    )
                    .setColor("#9B59B6")
                    .setFooter(`Campaign: ${message.guild.name}`);
            } else {
                // add the coins together, formatted into silver
                let money = parseInt(thisPlayer.inventory.platinum)*100 + parseInt(thisPlayer.inventory.gold)*10 + parseInt(thisPlayer.inventory.electrum)*5 + (parseInt(thisPlayer.inventory.silver)) + parseInt(thisPlayer.inventory.copper)/10;

                embed = await new Discord.MessageEmbed()
                    .setTitle(`${thisPlayer.name}'s inventory`)
                    .addFields(
                        { name: 'Coins', value: `${money} silver` },
                        { name: 'Potions', value: thisPlayer.inventory.potions, inline: true },
                        { name: 'Weapons', value: thisPlayer.inventory.weapons, inline: true },
                        { name: 'Backpack', value: thisPlayer.inventory.backpack, inline: true },
                        { name: 'Misc.', value: thisPlayer.inventory.allOtherItems, inline: true },
                        { name: 'Last updated', value: thisPlayer.inventory.lastUpdated }
                    )
                    .setColor("#9B59B6")
                    .setFooter(`Campaign: ${message.guild.name}`);
        }
        // Sends it to the channel
        if (send === "send") message.channel.send(embed);
    }

        // Show inventory. If no inventory, create inventory with username, potions, armor, weapons, set to 'empty' by default
        if(command === `${prefix}inventory`) {       
            let cat = messageArr.slice(1)[0]; 
            if (cat) cat.toLowerCase(); // Sets category of inventory
            let cat2 = messageArr.slice(1)[1]; // Additional category options
            let newItemArr = messageArr.slice(2);
            let newItem = newItemArr.join(' ');

            console.log(`cat = ${cat}, cat2 = ${cat2}, new item = ${newItem}`)

            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            })
            // Equate the displayName with the playerName holding the data
            inventoryData.players.forEach(player => {
                if (toShow === player.name) {
                    thisPlayer = player;
                } else {
                    console.log(player.name);
                    console.log("No player found.");
                }
            });

            // Adding and modifying items
            if (cat) {
                if (cat === "gold") {
                    gold = newItem;
                } else if (cat === "silver") {
                    silver = newItem;
                } else if (cat === "electrum") {
                    electrum = newItem;
                } else if (cat === "platinum") {
                    platinum = newItem;
                } else if (cat === "copper") {
                    copper = newItem;
                } 
                // Non-money items
                else if (cat === "potions") {
                    potions.push(newItem);
                    if (potions.includes("none")) potions.shift();
                } else if (cat === "weapons") {
                    weapons.push(newItem);
                    if (weapons.includes("none")) weapons.shift();
                } else if (cat === "backpack") {
                    backpack.push(newItem);
                    if (backpack.includes("none")) backpack.shift();
                } else if (cat === "misc") {
                    allOtherItems.push(newItem);
                    if (allOtherItems.includes("none")) thisPlayer.inventory.allOtherItems.shift();
                } 
                thisPlayer.inventory.lastUpdated = moment().format('MMMM Do, hh:mm a');
                fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    console.log(`writing to ${inventoryDataDir}`);
                });
            }
            
            createInventoryEmbed(thisPlayer, 'send');
        } 
        else if(command === `${prefix}create`) { // Used only for initial creation of inventory
            let cat = messageArr.slice(1)[0]; 
            if (cat) cat.toLowerCase(); // Sets category of inventory
            let cat2 = messageArr.slice(1)[1]; // Additional category options
            let newItemArr = messageArr.slice(2);
            let newItem = newItemArr.join(' ');

            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            });
            
            getPlayerData();
            if (cat === "gold") {
                thisPlayer.inventory.gold = newItem;
            } else if (cat === "silver") {
                thisPlayer.inventory.silver = newItem;
            } else if (cat === "electrum") {
                thisPlayer.inventory.electrum = newItem;
            } else if (cat === "platinum") {
                thisPlayer.inventory.platinum = newItem;
            } else if (cat === "copper") {
                thisPlayer.inventory.copper = newItem;
            } else if (cat === "new") {
                let newPlayer = message.guild.member(message.mentions.members.first().displayName) || newItem;
                thisPlayer = newPlayer;
                inventoryData.players.push(newPlayer);
                inventoryData.players.forEach(player => {
                    if (newPlayer === player.name) return message.channel.send(`This player already has an inventory set up.
                    Use the /inventory or /wallet commands to edit their inventory.`);
                })   
            }

            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            });
            createInventoryEmbed(thisPlayer, 'send');

        }
        else if(command === `${prefix}wallet`) {
            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            });
            createInventoryEmbed(thisPlayer, 'send', 'wallet');
        }
        else if (command === `${prefix}thisplayer`) message.channel.send("You are " + thisPlayer);


    } catch(e) {
        console.log(e.stack);
    }
});

client.login(token);