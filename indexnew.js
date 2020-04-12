// @ts-check
const fs = require('fs');
const moment = require('moment');
const Discord = require('discord.js');
const inventoryData = require('./utils/inventory.json'); // Searches for the data for your guild only
const Logger = require('./utils/logger');
const log = new Logger();

const client = new Discord.Client({disableMentions: 'everyone'});
const { BOT_TOKEN } = require('./utils/config.json');
const prefix = "/";

client.once('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    try {
        let link = await client.generateInvite(['MANAGE_MESSAGES', 'MANAGE_NICKNAMES', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS']);
        console.log(link);
    } catch(e) {
        console.log(e.stack);
    }
});

client.on('message', async message => {
    if(message.channel.type === 'dm') {
        const regexTest = /fuck/.test(message.content);
        if (regexTest) return message.author.send(`:poop: 僕は悪いボットじゃないよ！`)
        return message.author.send(`Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`)
    }
    else if (message.author === client.user) return; // stops function if author is itself
    const messageArr = message.content.split(" ");
    const command = messageArr[0];
    const commandKeywords = messageArr.slice(1);
    let args;
    let recipientPlayer;
    const validCommands = { 
        commands: 'inventory inv wallet create deleteplayer helpinventory add remove overwrite changelog dm',
        isValid: function(input) {
            let userInput;
            this.commands.split(' ').forEach(command=> {
                if (input === `${prefix}${command}`) userInput = input;
                else return;
            })
            if (userInput !== undefined) return true;
            else return false;
        }
    }
    if(!validCommands.isValid(command)) return;
    const myFunc = require('./utils/globalFunctions.js')(message);

    if (message.mentions.users.array().length > 0) {
        if (!message.member.hasPermission('BAN_MEMBERS') || !message.member.hasPermission('KICK_MEMBERS')) return myFunc.createResponseEmbed('channel', 'invalid', `You do not have sufficient privileges for this action.`);
        args = commandKeywords.slice(1); // accounts for @mention being the 2nd word in the message
        recipientPlayer = message.mentions.members.first().displayName; // all commands will be carried out on the @mentioned user
    } else {
        args = commandKeywords.slice(0);
        recipientPlayer = message.member.displayName; // all commands will be carried out on the author of the message
    };
    
    let thisGuildData;
    inventoryData.guilds.forEach(guild => {
        if (guild.campaignName === message.guild.name) thisGuildData = guild;
    })

    const build = require('./player')(message);
    const { create } = require('./commands/create')(message);
    const { showInventory, showWallet } = require('./commands/inv_wallet')(message);
    const add = require('./commands/add');
    const removeItem = require('./commands/remove');
    
    const thisGuild = new myFunc.Guild(thisGuildData);
    let currentPlayer = thisGuild.findPlayer(recipientPlayer);
    if (!currentPlayer && command !== `${prefix}create`) return myFunc.createResponseEmbed('channel', 'invalid', `No player named ${recipientPlayer} found.
    Use ${prefix}create to start an inventory for a new player.`)  

    log.green(`command was ${command}. recipient player is ${recipientPlayer}. 
    Args are ${args.join(' ')}.`);
    log.cyan(`You are ${currentPlayer.name} of ${thisGuild.name}.`);

    console.log(currentPlayer);
    try {
        if (thisGuild.findPlayer(recipientPlayer)) myFunc.writeChangelog(currentPlayer);
        switch (command) {
            case `${prefix}inv`:
            case `${prefix}inventory`:
                // MUST PASS IN THE currentPlayer OBJECT
                showInventory(currentPlayer, thisGuild);
                break;
            case `${prefix}wallet`:
                showWallet(currentPlayer, thisGuild);
                break;
            case `${prefix}add`:
                add(message, args, currentPlayer);
                myFunc.writeChangelog(currentPlayer);
                myFunc.writeToJSON(inventoryData, currentPlayer);
                break;
            case `${prefix}remove`:
                removeItem(message, args, currentPlayer);
                myFunc.writeChangelog(currentPlayer);
                myFunc.writeToJSON(inventoryData, currentPlayer);
                break;
            case `${prefix}overwrite`:

                myFunc.writeChangelog(currentPlayer);
    
                break;
            case `${prefix}create`:
                if (currentPlayer) return myFunc.createResponseEmbed('channel', 'invalid', `This user already has an inventory set up!`);
                const nP = create(recipientPlayer, args);
                thisGuild.players.push(nP);
                myFunc.writeToJSON(inventoryData);
                myFunc.createResponseEmbed('channel', 'success', `Created ${recipientPlayer}'s inventory!`);
                break;
            case `${prefix}deleteplayer`:
                // deletePlayer is a method on the Guild constructor. Code can be found at utils/globalFunctions.
                // must pass the recipientPlayer which is a string... I need to fix this but this works
                thisGuild.deletePlayer(recipientPlayer);
                myFunc.writeToJSON(inventoryData, currentPlayer); 
                myFunc.createResponseEmbed('channel', 'success', `Player ${recipientPlayer}'s inventory successfully deleted.`)
                break;
            case `${prefix}dm`:
    
                myFunc.writeChangelog(currentPlayer);
                break;
            case `${prefix}helpinventory`:
    
                break;
            case `${prefix}changelog`:
                const { changelog } = require('./commands/changelog');
                console.log('fuck you');
                
                changelog(message, currentPlayer);
                break;
            default: // Keep blank so the bot doesn't interfere with other bots
                return;
        }
    } catch (err) {
        console.log(err.stack);
        let errorEmbed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(`Something went wrong!`)
            .setDescription(`Hi **${message.author.username}**, 
            You tried to execute: \`${message}\` but it returned the following error.`)
            .addField('Problem:', `\`${err}\`.
            If you did not get any other error messages describing the issue in plain English, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`)
            .addField('At:', moment().format('MMMM Do, hh:mm a'));

        if (!message.author.bot) message.author.send(errorEmbed);
    }
}); // end of client.on('message')

client.on('error', (err) => {
    console.log(err);
})

client.login(BOT_TOKEN);