const Discord = require('discord.js');
const moment = require('moment');
const Logger = require('./utils/logger');
const log = new Logger();
const Table = require('./utils/Table');
const Player = require('./utils/Player');
const Guild = require('./utils/Guild');

const client = new Discord.Client({disableMentions: 'everyone'});
const BOT_TOKEN = process.env.BOT_TOKEN || require('./private.json').BOT_TOKEN;
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
    if(message.channel.type === 'dm' && !message.author.bot) {
        const regexTest = /fuck|dick/.test(message.content); // Hidden easter egg lol
        if (regexTest) return message.author.send(`:poop:僕は悪いボットではないよ！`).catch(console.error);
        else return message.author.send(`Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`)
    };
    if (message.author === client.user) return; // stops function if author is the bot itself
    const messageArr = message.content.split(" ");
    const command = messageArr[0];
    const commandKeywords = messageArr.slice(1); // used by the if statement
    
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
    const { writeToJSON, writeChangelog, createResponseEmbed } = require('./utils/globalFunctions.js')(message);

    let args; // modified by the if statement
    let recipientPlayerName; // modified by the if statement
    let recipientPlayerObject;

    if (message.mentions.users.array().length > 0) {
        if (!message.member.hasPermission('BAN_MEMBERS') || !message.member.hasPermission('KICK_MEMBERS')) return createResponseEmbed('channel', 'invalid', `User <@${message.author.id}> does not have sufficient privileges for this action.`);
        args = commandKeywords.slice(1); // accounts for @mention being the 2nd word in the message
        recipientPlayerObject = message.mentions.members.first();
        recipientPlayerName = recipientPlayerObject.displayName; // all commands will be carried out on the @mentioned user
    } else {
        args = commandKeywords.slice(0);
        recipientPlayerObject = message.member; // all commands will be carried out on the author of the message
        recipientPlayerName = recipientPlayerObject.displayName;
    };
    
    const currentGuild = new Guild({
        id: message.guild.id,
        name: message.guild.name,
        players: message.guild.members.cache.map(m => m.id)
    });
    console.log(currentGuild);
    try {
        await currentGuild.dbConnect();
        console.log(await currentGuild.dbRead());
    } catch (error) {
        console.log(console.error);
    } finally {
        setTimeout(
            async () => { await currentGuild.dbDisconnect() },
            10000
        )
    }
    return;
    const { showInventory, showWallet } = require('./commands/inv_wallet')(message);

    log.green(`command was ${command}. recipient player is ${recipientPlayerName}. 
    Args are ${args.join(' ')}.`);

    try {
        // if (thisGuild.findPlayer(recipientPlayerName)) writeChangelog(currentPlayer);
        switch (command) {
            case `${prefix}inv`:
            case `${prefix}inventory`:
                showInventory(currentPlayer, thisGuildData);
                break;
            case `${prefix}wallet`:
                showWallet(currentPlayer, thisGuild);
                break;
            case `${prefix}add`:
                const { add } = require('./commands/add');
                add(message, args, currentPlayer);
                writeChangelog(currentPlayer);
                writeToJSON(inventoryData);
                // update the guild
                break;
            case `${prefix}remove`:
                const removeItem = require('./commands/remove');
                removeItem(message, args, currentPlayer);
                writeChangelog(currentPlayer);
                writeToJSON(inventoryData);
                break;
            case `${prefix}overwrite`:
                const overwrite = require('./commands/overwrite');
                overwrite(message, args, currentPlayer);
                writeChangelog(currentPlayer);
                break;
            case `${prefix}create`:
                // if (currentPlayer) return createResponseEmbed('channel', 'invalid', `This user already has an inventory set up!`);
                const nP = new Player(message, {
                    id: recipientPlayerObject.id,
                    name: a,
                })
                if (args !== "") nP.prepack(args[0], args[1], args[2], args[3]);
                console.log(await nP.add());
                createResponseEmbed('channel', 'success', `Created ${recipientPlayerName}'s inventory!`);
                break;
            case `${prefix}deleteplayer`:
                // deletePlayer is a method on the Guild constructor. Code can be found at utils/globalFunctions.
                thisGuild.deletePlayer(currentPlayer);
                writeToJSON(inventoryData); 
                createResponseEmbed('channel', 'success', `Player ${recipientPlayerName}'s inventory successfully deleted.`)
                break;
            case `${prefix}dm`:
                const { dm } = require('./commands/dm');
                dm(message, currentPlayer);
                writeChangelog(currentPlayer);
                break;
            case `${prefix}helpinventory`:
                const help = require('./commands/help');
                help(message);
                break;
            case `${prefix}changelog`:
                const { changelog } = require('./commands/changelog');        
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
    } finally {
        currentGuild.dbDisconnect();
    }
}); // end of client.on('message')

client.on('error', (err) => {
    console.log(err);
})

client.login(BOT_TOKEN);