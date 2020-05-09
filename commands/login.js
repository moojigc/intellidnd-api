// This function allows user and Dungeon Master to access their inventory from the web.
async function webLogin(message, player) {
    const { MessageEmbed } = require('discord.js');
    const { channelOrDM } = require('../utils/globalFunctions')(message);
    const url = process.env.MONGODB_URI ? `https://dnd-inventory-web.herokuapp.com/login/${player._id}` : `http://localhost:3000/login/${player._id}` 
    let embed = new MessageEmbed()
        .setDescription(`You can [login here](${url}) to manage **${player.name}'s** inventory with a graphical interface.`);
    message.author.send(embed);
}

module.exports = webLogin;
