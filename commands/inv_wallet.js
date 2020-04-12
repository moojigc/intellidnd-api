const inventoryData  = require('../utils/inventory.json');

module.exports = function(message) {
    const myFunc = require('../utils/globalFunctions')(message);
    let messageArr = message.content.split(" ");
    let cat = messageArr.slice(1)[0];

    function showInventory(player, guild) {
        switch (cat) {
            case 'everyone':
                guild.players.forEach(player => myFunc.createInventoryEmbed(player, 'DM'));
                break;
            default: 
                myFunc.createInventoryEmbed(player, 'send')
        }
    }
    function showWallet(player, guild) {
        switch (cat) {
            case 'everyone':
                guild.players.forEach(player => myFunc.createInventoryEmbed(player, 'DM'));
                break;
            default:
                myFunc.createInventoryEmbed(player, 'send', 'wallet');
        }
    }
    return {
        showInventory: showInventory,
        showWallet: showWallet
    }
}