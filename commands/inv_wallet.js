const Player = require('../models/Player');

module.exports = function(message) {
    const { createInventoryEmbed } = require('../utils/globalFunctions')(message);
    let messageArr = message.content.split(" ");
    let cat = messageArr.slice(1)[0];

    async function showInventory(player, guildMembers) {
        switch (cat) {
            case '@everyone':
                let allPlayers = guildMembers.map(p => new Player(message, { id: p }))
                // console.log(allPlayers);
                function validPlayers() {
                    return allPlayers.forEach(player => player.checkExisting().then(res => {
                        console.log(res);
                        player.name = res.name;
                        if (res !== false) return createInventoryEmbed(player, 'DM');
                    }))
                }
                validPlayers();
                break;
            default: 
                return createInventoryEmbed(player, 'send')
        }
    }
    function showWallet(player, guildMembers) {
        switch (cat) {
            case '@everyone':
                let players = guildMembers.map(p => new Player(message, { id: p }))
                players.forEach(player => createInventoryEmbed(player, 'DM', 'wallet'));
                break;
            default:
                return createInventoryEmbed(player, 'send', 'wallet');
        }
    }
    return {
        showInventory: showInventory,
        showWallet: showWallet
    }
}