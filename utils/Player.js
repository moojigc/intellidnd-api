const moment = require('moment');
const Table = require('./Table');
const Guild = require('./Guild');

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
}

// async function test() {
//     let message = {
//         content: "/create"
//     }
//     let guild = new Guild({
//         id: 2,
//         name: 'Bot Testing'
//     })
//     let moojig = new Player(message, {
//         id: 24,
//         name: "DIO",
//         guild: "Bot Testing",
//         guildID: 2
//     })
//     console.log(await moojig.dbRead())
//     // console.log(await moojig.prepack(0, 0, true).dbReplace())
// }

// test();

module.exports = Player;

