const inventoryData  = require('../utils/inventory.json');

module.exports = function(message) {
    const { createInventoryEmbed } = require('../utils/globalFunctions')(message);
    let messageArr = message.content.split(" ");
    let cat = messageArr.slice(1)[0];

    function showInventory(player, guild) {
        switch (cat) {
            case 'everyone':
                guild.players.forEach(player => createInventoryEmbed(player, 'DM'));
                break;
            default: 
                createInventoryEmbed(player, 'send')
        }
    }
    function showWallet(player, guild) {
        switch (cat) {
            case 'everyone':
                guild.players.forEach(player => createInventoryEmbed(player, 'DM'));
                break;
            default:
                createInventoryEmbed(player, 'send', 'wallet');
        }
    }
    return {
        showInventory: showInventory,
        showWallet: showWallet
    }
}