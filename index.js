const { Client, MessageEmbed } = require('discord.js'),
    moment = require('moment'),
    Table = require('./models/Table'),
    Player = require('./models/Player'),
    Guild = require('./models/Guild');

const client = new Client({disableMentions: 'everyone'}),
    BOT_TOKEN = process.env.BOT_TOKEN || require('./private.json').BOT_TOKEN,
    prefix = "/";

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
        const regexTest = /fuck|dick|stupid/.test(message.content); // Hidden easter egg lol
        if (regexTest) return message.author.send(`:poop:僕は悪いボットではないよ！`).catch(console.error);
        else return message.author.send(`Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`)
    };
    // stops function if author is the bot itself
    if (message.author === client.user) return; 

    // Declare all constants
    const messageContentLowerCase = message.content.toLowerCase(), 
        messageArr = messageContentLowerCase.split(' '),
        command = messageArr[0].split('').slice(1).join(''),
        commandKeywords = messageArr.slice(1), // used by the if statement
        validCommands = { 
            commands: 'inventory inv wallet create deleteplayer helpinventory add remove overwrite changelog dm',
            isValid: function(input) {
                let userInput;
                this.commands.split(' ').forEach(command=> {
                    if (input === command) userInput = input;
                    else return;
                })
                if (userInput !== undefined) return true;
                else return false;
            }
        },
        { createResponseEmbed } = require('./utils/globalFunctions.js')(message);

    // End whole script if no valid command entered
    if(!validCommands.isValid(command)) return;

    // Declare mutable variables
    let args,
        recipientPlayerName,
        recipientPlayerObject;

    // Check whether acting upon author of the message or a mentioned user, or @ everyone
    if (message.mentions.users.array().length > 0 || message.mentions.everyone) {
        if (!message.member.hasPermission('BAN_MEMBERS') || !message.member.hasPermission('KICK_MEMBERS')) 
            return createResponseEmbed('channel', 'invalid', `User <@${message.author.id}> does not have sufficient privileges for this action.`);

        args = commandKeywords.slice(1); // accounts for @mention being the 2nd word in the message
        nullObject = { id: null, displayName: '@everyone' }; // Prevents errors when getting the inventory of @everyone
        recipientPlayerObject = (commandKeywords[0] === '@everyone') ? nullObject : message.mentions.members.first();
        recipientPlayerName = recipientPlayerObject.displayName; // all commands will be carried out on the @mentioned user
    } else {
        args = commandKeywords.slice(0);
        recipientPlayerObject = message.member; // all commands will be carried out on the author of the message
        recipientPlayerName = recipientPlayerObject.displayName;
    };
    
    // Map Discord server into a Guild object to compare against Mongo database
    const currentGuild = new Guild({
        id: message.guild.id,
        name: message.guild.name,
        players: message.guild.members.cache.map(m => m.id + message.guild.id)
    });
    // Map recipient player into Player object to compare against Mongo database
    const currentPlayer = new Player(message, {
        // My database uses the user's Discord ID and Guild ID combined to map players.
        // This allows players to use the bot in more than 1 Discord server at a time without worrying about overwriting their data.
        id: recipientPlayerObject.id + currentGuild._id,
        name: recipientPlayerName,
        guild: currentGuild.name,
        // The Discord server ID is used to all the Dungeon Master to see the inventory of every player at once.
        guildID: currentGuild._id
    })

    try {
        let dataIfExists = await currentPlayer.checkExisting();
        if (!dataIfExists && command !== 'create' && recipientPlayerName !== '@everyone') return createResponseEmbed('channel', 'invalid', `No data for ${recipientPlayerName}. Run /create to start an inventory for this player.`)
        switch (command) {
            case `inv`:
            case `inventory`:
                await currentGuild.dbUpsert();
                const { showInventory } = require('./commands/inv_wallet')(message);

                await showInventory(currentPlayer, currentGuild.players);
                break;
            case `wallet`:
                const { showWallet } = require('./commands/inv_wallet')(message);
                showWallet(currentPlayer, currentGuild.players);
                break;
            case `add`:
                const { add } = require('./commands/add');
                add(message, args, currentPlayer);
                currentPlayer.writeChangelog(message.content);
                currentPlayer.dbUpdate({ inventory: currentPlayer.inventory, changelog: currentPlayer.changelog });

                break;
            case `remove`:
                const removeItem = require('./commands/remove');
                removeItem(message, args, currentPlayer);
                currentPlayer.writeChangelog(message.content);
                currentPlayer.dbUpdate({ inventory: currentPlayer.inventory, changelog: currentPlayer.changelog });

                break;
            case `overwrite`:
                const overwrite = require('./commands/overwrite');
                overwrite(message, args, currentPlayer);
                currentPlayer.writeChangelog(message.content);
                console.log(currentPlayer.inventory);
                currentPlayer.dbUpdate({ inventory: currentPlayer.inventory, changelog: currentPlayer.changelog });

                break;
            case `create`:
                if (!!await currentPlayer.checkExisting()) return createResponseEmbed('channel', 'invalid', `This user already has an inventory set up!`);
                console.log('Creating player...');
                let [prepack, gold, silver, DMsetting] = args;
                if (prepack === "prepack") {
                    currentPlayer.prepack(gold, silver, DMsetting);}
                else {
                    currentPlayer.createInventory();
                }
                let response = await currentPlayer.dbInsert()
                if (response.insertedCount === 1) createResponseEmbed('channel', 'success', `Created ${recipientPlayerName}'s inventory!`, currentPlayer);
                else createResponseEmbed('channel', 'invalid', 'Sorry, there was an error with the database server. Please try again.', currentPlayer);
                
                break;
            case `deleteplayer`:
                // deletePlayer is a method on the Guild constructor. Code can be found at utils/globalFunctions.
                let deletion = await currentPlayer.dbDelete()
                if (deletion.deletedCount === 1) createResponseEmbed('channel', 'success', `Player ${recipientPlayerName}'s inventory successfully deleted.`);
                else createResponseEmbed('channel', 'invalid', 'Sorry, there was an error with the database server. Please try again.', currentPlayer);

                break;
            case `dm`:
                const dm = require('./commands/dm');
                dm(message, currentPlayer);
                currentPlayer.writeChangelog(message.content);;
                currentPlayer.dbUpdate({ notificationsToDM: currentPlayer.notificationsToDM, changelog: currentPlayer.changelog });

                break;
            case `helpinventory`:
                const help = require('./commands/help');
                help(message);
                break;
            case `changelog`:
                const { changelog } = require('./commands/changelog');        
                changelog(message, currentPlayer);
                break;
            default: // Keep blank so the bot doesn't interfere with other bots
                return;
        }
        process.on('SIGINT', () => currentGuild.dbDisconnect());
    } catch (err) {
        console.trace(err);
        let errorEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`Something went wrong!`)
            .setDescription(`Hi **${message.author.username}**, 
            You tried to execute: \`${message}\` but it returned the following error.`)
            .addField('Problem:', `\`${err}\`.
            If you did not get any other error messages describing the issue in plain English, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`)
            .addField('At:', moment().format('MMMM Do, hh:mm a'));

        if (!message.author.bot) message.author.send(errorEmbed);
    }
}); 
// end of client.on('message')

client.on('error', (err) => {
    console.log(err);
})

client.login(BOT_TOKEN);

