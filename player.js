const moment = require('moment');

module.exports = function(message) {
    function Player(name) {
        this.name = name;
        this.notificationsToDM = false;
        this.inventory;
        this.createInventory = function(prepack, goldCoins, silverCoins) {
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
        };
        this.changelog = [{
            on: `at ${moment().format("hh:mm a on MMMM Do YYYY")}`,
            command: message.content,
        }];
    }
    return {
        Player: Player
    }
}