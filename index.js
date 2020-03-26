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
        let platinum;
        let gold;
        let electrum;
        let silver;
        let copper;
        let potions; 
        let weapons;
        let backpack;
        let lastUpdated;
        
        // Equate the displayName with the playerName holding the data
        function getPlayerData() {
            inventoryData.players.forEach(player => {
                console.log(player.name)
                if (toShow === player.name) thisPlayer = player;
                platinum = player.inventory.platinum;
                gold = player.inventory.gold;
                electrum = player.inventory.electrum;
                silver = player.inventory.silver;
                copper = player.inventory.copper;
                potions = player.inventory.potions;
                weapons = player.inventory.weapons;
                backpack = player.inventory.backpack;
                allOtherItems = player.inventory.allOtherItems;
                lastUpdated = player.inventory.lastUpdated;

                console.log(copper, electrum, platinum);
            });
            if (thisPlayer === undefined) return message.channel.send("No player found.");
        }

        // create embed
        async function createInventoryEmbed(send, type) {
            getPlayerData();
            // Create user wallet or full inventory
            let embed;
            if (type === 'wallet') {         
                console.log(thisPlayer.inventory);
                embed = await new Discord.MessageEmbed()
                    .setTitle(`${thisPlayer.name}'s wallet`)
                    .addFields(
                        { name: 'Platinum', value: platinum, inline: true },
                        { name: 'Gold', value: gold, inline: true },
                        { name: 'Electrum', value: electrum, inline: true },
                        { name: 'Silver', value: silver, inline: true },
                        { name: 'Copper', value: copper, inline: true }
                    )
                    .setColor("#9B59B6")
                    .setFooter(`Campaign: ${message.guild.name}`);
            } else {
                // add the coins together, formatted into silver
                let money = parseInt(platinum)*100 + parseInt(gold)*10 + parseInt(electrum)*5 + (parseInt(silver)) + parseInt(copper)/10;

                embed = await new Discord.MessageEmbed()
                    .setTitle(`${thisPlayer.name}'s inventory`)
                    .addFields(
                        { name: 'Coins', value: `${money} silver` },
                        { name: 'Potions', value: potions, inline: true },
                        { name: 'Weapons', value: weapons, inline: true },
                        { name: 'Backpack', value: backpack, inline: true },
                        { name: 'Misc.', value: allOtherItems, inline: true },
                        { name: 'Last updated', value: lastUpdated }
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

            getPlayerData();

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
            
            createInventoryEmbed('send');

        } 
        else if(command === `${prefix}create`) { // Used only for initial creation of inventory
            let cat = messageArr.slice(1)[0]; 
            if (cat) cat.toLowerCase(); // Sets category of inventory
            let cat2 = messageArr.slice(1)[1]; // Additional category options
            let newItemArr = messageArr.slice(2);
            let newItem = newItemArr.join(' ');
            
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
            createInventoryEmbed('send');

        }
        else if(command === `${prefix}wallet`) {
            getPlayerData();

            createInventoryEmbed('send', 'wallet');
        }


    } catch(e) {
        console.log(e.stack);
    }

    try {
        if(command === `${prefix}mute`) {
            if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("You do not have admin privilges.")

            let toMute = message.guild.member(message.mentions.users.first());
            if (!toMute) return message.channel.send("You did not specify a user mention.");
            
            let role = message.guild.roles.fetch()
                .then(role => {
                    role.name === "SADB Muted"
                })
                .catch(console.error);
            console.log(role);
            if(role === undefined) {
                try {
                    role = await message.guild.roles.create({
                        data: {
                            name: "SADB Muted",
                            color: "#000000",
                            permissions: [],
                        }
                    });
                    // console.log(message.guild);
                    message.guild.channels.cache.each(async (channel, id) => {
                        await channel.updateOverwrite(role, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                        });
                        console.log("Hi I ran");
                    })
                } catch(e) {
                    console.log(e.stack)
                }
            }
            // console.log(role); 
            return;

            if(toMute.roles.member.guild.id.includes(role.id)) return message.channel.send("This user is already muted.");
            
            // await toMute.roles.add(role);
            // message.channel.send("I have muted them.");
            
            return;
        }
    } catch(e) {console.log(e.stack)}

});



client.login(token);