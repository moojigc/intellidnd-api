const moment = require('moment');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = function (message) {
    const userEntry = {
        array: ['gold','silver','electrum','platinum','copper','potions','potion','weapons','weapon','backpack','misc'],
        isValid: function(cat) {
            if (this.array.includes(cat)) {
                return true;
            } else {
                return false;
            }
        },
    };
    const coins = {
        array: ['gold','silver','electrum','platinum','copper'],
        isCoin: function(cat) {
            if (this.array.includes(cat)) {
                return true;
            } else {
                return false;
            }
        },
    };
    function writeToJSON(data, player) {
        fs.writeFile(`./utils/inventory.json`, JSON.stringify(data, null, 2), function(err) {
            if (err) return console.log(err);
            console.log(`writing to inventory.json`);
        });
    };
    function writeChangelog(player) {
        let change = {
            on: moment().format('hh:mm a, MMMM Do, YYYY'),
            command: message.content,
            gold: player.inventory.gold
        }
        if (player.changelog.length > 9) {
            player.changelog.shift();
            player.changelog.push(change);
        } else {
            player.changelog.push(change);
        }
    };
    function createInventoryEmbed(player, send, type) {
        // Create user wallet or full inventory
        // must pass in the player object from inventory.json
        let embed;
        const { gold, silver, platinum, electrum, copper, potions, weapons, misc, lastUpdated } = player.inventory;
        if (type === 'wallet') {         
            embed = new Discord.MessageEmbed()
                .setTitle(`${player.name}'s wallet`)
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
            const money = parseInt(platinum)*10 + parseInt(gold) + parseInt(electrum)/2 + parseInt(silver)/10 + parseInt(copper)/100;
            
            const potionsList = {
                potions: potions,
                makeReadable: function() {
                    let readableList = [];
                    this.potions.forEach(potion => {
                        let combined = `${potion.name} x${potion.quantity}`;
                        readableList.push(combined);
                    });
                    return readableList;
                }
            }
            const weaponsList = {
                weapons: weapons,
                makeReadable: function() {
                    let readableList = [];
                    this.weapons.forEach(weapon => {
                        let combined = `${weapon.name} x${weapon.quantity}`;
                        readableList.push(combined);
                    });
                    return readableList;
                }
            }
            const miscList = {
                misc: misc,
                makeReadable: function() {
                    let readableList = [];
                    this.misc.forEach(miscItem => {
                        let combined = `${miscItem.name} x${miscItem.quantity}`;
                        readableList.push(combined);
                    });
                    return readableList;
                }
            }
            embed = new Discord.MessageEmbed()
                .setTitle(`${player.name}'s inventory`)
                .addFields(
                    { name: 'Coins', value: `${money} gold` },
                    { name: 'Potions', value: potionsList.makeReadable(), inline: true },
                    { name: 'Weapons', value: weaponsList.makeReadable(), inline: true },
                    { name: 'Misc.', value: miscList.makeReadable(), inline: true },
                    { name: 'Last updated', value: lastUpdated }
                )
                .setColor("#9B59B6")
                .setFooter(`Campaign: ${message.guild.name}`)
            };  
        if (send === "send") {
            return channelOrDM(player, embed);
        } else if (send === "DM") {
            return message.author.send(embed);
        }
    }
    function channelOrDM(player, botMessageContents) { // sends message to either channel or DMs
        if (player.notificationsToDM === true) {
            return message.author.send(botMessageContents);
        } else {
            return message.channel.send(botMessageContents);
        }
    };
    function createResponseEmbed(send, type, contents, player) {
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
            channelOrDM(player, embed);
        } else if (send === "DM") {
            message.author.send(embed);
        } else if (send === "channel") {
            message.channel.send(embed);
        }
    };
    return {
        userEntry: userEntry,
        coins: coins,
        writeToJSON: writeToJSON,
        writeChangelog: writeChangelog,
        createInventoryEmbed: createInventoryEmbed,
        channelOrDM: channelOrDM,
        createResponseEmbed: createResponseEmbed
    }
};