const moment = require('moment');
const MessageEmbed = require('discord.js').MessageEmbed;

function capitalize(input) {
    let words = input.split(' ');
    const caps = words.map(w => {
        let englishKeywords = {
            keywords: ['of', 'a', 'the', 'an', 'to'],
            match: function() {
                if (this.keywords.filter(keyword => keyword === w).length > 0) return true;
                else return false;
            }
        };
        
        if (englishKeywords.match() === false) return w.slice()[0].toUpperCase() + w.substring(1).toLowerCase();
        else return w.toLowerCase();
    });
    return caps.join(' ');
}

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
    function channelOrDM(player, botMessageContents) { // sends message to either channel or DMs
        try {
            if (player.notificationsToDM === true) 
                return message.author.send(botMessageContents);
            else 
                return message.channel.send(botMessageContents);
            
        } catch (error) {
            console.log(error)
        }
    };
    function createResponseEmbed(send, type, contents, player) {
        let embed;
        try {
            if (type === 'invalid') {
                embed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(contents);
            } else if (type === 'success') {
                embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(contents);
            }

            if (send === "send") 
                channelOrDM(player, embed);
            else if (send === "DM") 
                message.author.send(embed);
            else if (send === "channel") 
                message.channel.send(embed);
            
        } catch (error) {
            console.log(error)
        }
    };
    function createInventoryEmbed(player, send, type) {
        const { channelOrDM } = require('../utils/globalFunctions.js')(message);
        // Create user wallet or full inventory
        // must pass in the Player object
        let embed;
        const { lastUpdated } = player;
        const { gold, silver, platinum, electrum, copper, potions, weapons, misc } = player.inventory;
        if (type === 'wallet') {         
            embed = new MessageEmbed()
                .setTitle(`${player.name}'s wallet`)
                .addFields(
                    { name: 'Platinum', value: platinum, inline: true },
                    { name: 'Gold', value: gold, inline: true },
                    { name: 'Electrum', value: electrum, inline: true },
                    { name: 'Silver', value: silver, inline: true },
                    { name: 'Copper', value: copper, inline: true }
                )
                .setColor("#9B59B6")
                .setFooter(`Campaign: ${player.guild}`);
        } else {
            // add the coins together, formatted into silver
            const money = parseInt(platinum)*10 + parseInt(gold) + parseInt(electrum)/2 + parseInt(silver)/10 + parseInt(copper)/100;
            
            const potionsList = {
                potions: potions,
                makeReadable: function() {
                    let readableList = [];
                    this.potions.forEach(potion => {
                        let combined = `${capitalize(potion.name)} x${potion.quantity}`;
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
                        let combined = `${capitalize(weapon.name)} x${weapon.quantity}`;
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
                        let combined = `${capitalize(miscItem.name)} x${miscItem.quantity}`;
                        readableList.push(combined);
                    });
                    return readableList;
                }
            }
            embed = new MessageEmbed()
                .setTitle(`${player.name}'s inventory`)
                .addFields(
                    { name: 'Coins', value: `${money} gold` },
                    { name: 'Potions', value: potionsList.makeReadable(), inline: true },
                    { name: 'Weapons', value: weaponsList.makeReadable(), inline: true },
                    { name: 'Misc.', value: miscList.makeReadable(), inline: true },
                    { name: 'Last updated', value: moment(lastUpdated).format('MMMM Do, hh:mm a') }
                )
                .setColor("#9B59B6")
                .setFooter(`Campaign: ${player.guild}`)
            };  
        if (send === "send") {
            return channelOrDM(player, embed);
        } else if (send === "DM") {
            return message.author.send(embed);
        }
    }
    return {
        userEntry: userEntry,
        coins: coins,
        channelOrDM: channelOrDM,
        createResponseEmbed: createResponseEmbed,
        createInventoryEmbed: createInventoryEmbed
    }
};