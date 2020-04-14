module.exports = {
    dm: function(message, player) {
        const { createResponseEmbed } = require('../utils/globalFunctions')(message);
        const cat = message.content.split(' ')[1];
        if (cat === 'on') {
            player.notificationsToDM = true;
            createResponseEmbed('send', 'success', 'You will now receive all confirmations via DMs only.', player);
        } else if (cat === 'off') {
            player.notificationsToDM = false;
            createResponseEmbed('send', 'success', 'I will now send you updates within the channel.', player);
        }
    }
}