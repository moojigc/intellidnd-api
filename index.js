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
    let args = messageArr.slice(1);

    // console.log(messageArr);
    // console.log(command);
    // console.log(args);

    if(!command.startsWith(prefix)) return;

    try {
        // Show inventory. If no inventory, create inventory with username, potions, armor, weapons, set to 'empty' by default
        if(command === `${prefix}inventory`) {
            let sender = message.author;
            // let toShow = message.mentions.members.first().displayName || message.member.displayName;
            let toShow = message.member.displayName;
            
            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            })
            // Equate the displayName with the playerName holding the data
            var thisPlayer;
            console.log(typeof(thisPlayer));

            inventoryData.players.forEach(player => {
                if (toShow === player.name) {
                    thisPlayer = player;
                } else {
                    console.log(player.name);
                    console.log("No player found.");
                }
            });

            let embed = new Discord.MessageEmbed()
                .setAuthor(inventoryData.campaignName)
                .setDescription(`Showing ${toShow}'s inventory:`)
                .addFields(
                    { name: 'Gold', value: thisPlayer.inventory.gold },
                    { name: 'Silver', value: thisPlayer.inventory.silver },
                    { name: 'Backpack', value: thisPlayer.inventory.backpack },
                    { name: 'Potions', value: thisPlayer.inventory.potions },
                    { name: 'Weapons', value: thisPlayer.inventory.weapons },
                    { name: 'All other items', value: thisPlayer.inventory.allOtherItems },
                    { name: 'Last updated', value: thisPlayer.inventory.lastUpdated }
                )
                .setColor("#9B59B6");

            message.channel.send(embed);

            console.log(thisPlayer);
        }
        // 



        if(command === `${prefix}editinventory`) {
            let sender = message.author;
            let toShow = message.member.displayName;

            // Equate the displayName with the playerName holding the data
            var players = inventoryData.players;
            // var thisPlayerStringified = JSON.stringify(`${players}.${toShow}`);
            var thisPlayer = players + '.' + toShow;
            
            fs.writeFile(inventoryDataDir, JSON.stringify(inventoryData, null, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(`writing to ${inventoryDataDir}`);
            })

            let embed = new Discord.MessageEmbed()
                .setAuthor(`Showing ${toShow}'s inventory:`)
                .addFields(
                    { name: 'Gold', value: thisPlayer.gold },
                    { name: 'Silver', value: thisPlayer.silver },
                    { name: 'Backpack', value: thisPlayer.backpack },
                    { name: 'Potions', value: thisPlayer.potions },
                    { name: 'Weapons', value: thisPlayer.weapons },
                    { name: 'All other items', value: thisPlayer.allOtherItems },
                    { name: 'Last updated', value: thisPlayer.lastUpdated }
                )
                .setColor("#9B59B6");

            message.channel.send(embed);
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

    // if(message.content.startsWith(`${prefix}kick`)) {
    //     message.channel.send('kick');

    //     let member = message.mentions.members.first();
    //     message.channel.send(":wave: " + member.displayName);
    // }
});



client.login(token);