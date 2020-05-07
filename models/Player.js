const moment = require('moment'),
    Table = require('./Table'),
    Guild = require('./Guild'),
    { MessageEmbed } = require('discord.js');
    
class Player extends Table {
    constructor(message, params) {
        let defaults = { collection: null, _id: null, guild: null };
        let { id, name, guild, guildID } = params ? params : defaults;
        super({
            collection: 'players', 
            id: id 
        });
        this.name = name;
        this.guild = guild;
        this.guildID = guildID;
        this.notificationsToDM = false;
        this.inventory = {};
        this.changelog = [{
            on: `at ${moment().format("hh:mm a on MMMM Do YYYY")}`,
            command: message.content,
        }];
    }
    createInventory(prepack, goldCoins, silverCoins) {
        if (prepack === 'prepack') {
            let prepackaged = {
                gold: 0 + parseInt(goldCoins),
                silver: 0 + parseInt(silverCoins),
                copper: 0,
                platinum: 0,
                electrum: 0,
                potions: [
                    {
                        name: "none",
                        quantity: 0
                    }
                ],
                weapons: [
                    {
                        name: "none",
                        quantity: 0
                    }
                ],
                misc: [
                    {
                        name: "crowbar",
                        quantity: 1
                    },
                    {
                        name: "hammer",
                        quantity: 1
                    },
                    {
                        name: "pitons",
                        quantity: 10
                    },
                    {
                        name: "torches",
                        quantity: 10
                    },
                    {
                        name: "rations",
                        quantity: 10
                    },
                    {
                        name: "feet of hempen rope",
                        quantity: 100
                    }
                ],
                lastUpdated: moment().format("MMMM Do, hh:mm a")
            };
            this.inventory = prepackaged;
        } else {
            let empty = {
                gold: 0,
                silver: 0,
                copper: 0,
                platinum: 0,
                electrum: 0,
                potions: [
                    {
                        name: "none",
                        quantity: 0
                    }
                ],
                weapons: [
                    {
                        name: "none",
                        quantity: 0
                    }
                ],
                misc: [
                    {
                        name: "none",
                        quantity: 0
                    }
                ],
                lastUpdated: moment().format("MMMM Do, hh:mm a")
                };
            this.inventory = empty;
        };
        return this;
    };
    prepack(addGold, addSilver, DMsetting) {
        this.createInventory('prepack', addGold, addSilver);
        if (DMsetting === 'DM') this.notificationsToDM = true;
        return this;
    };
    writeChangelog(command) {
        let change = {
            on: moment().format('hh:mm a, MMMM Do, YYYY'),
            command: command,
        }
        if (this.changelog.length > 9) {
            this.changelog.shift();
            this.changelog.push(change);
        } else {
            this.changelog.push(change);
        }
    }
    async checkExisting() {
        let response = await this.dbRead()
        if (response === null) return false;
        else {
            this.inventory = response.inventory;
            this.changelog = response.changelog;
            this.notificationsToDM = response.notificationsToDM;
            return response
        };
    }
}

module.exports = Player;

