const { Client, MessageEmbed } = require("discord.js"),
	moment = require("moment"),
	{ Player, Guild } = require("./models"),
	{ connect } = require("mongoose"),
	client = new Client({ disableMentions: "everyone" }),
	MONGODB_URI = process.env.MONGODB_URI || require("./private.json").dev.MONGODB_URI,
	BOT_TOKEN = process.env.BOT_TOKEN || require("./private.json").BOT_TOKEN;

connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
	.then((conn) => {
		console.log(`Connected to ${conn.connections[0].db.databaseName}`);
	})
	.catch(console.error);

client.once("ready", async () => {
	console.log(`${client.user.username} is ready!`);
	try {
		let link = await client.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "EMBED_LINKS"]);
		console.log(link);
	} catch (e) {
		console.log(e.stack);
	}
});

client.on("guildCreate", async (guild) => {
	try {
		let [defaultChannel] = guild.channels.cache.filter((channel) => {
			if (channel.type == "text" && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) return true;
			else return false;
		});
		defaultChannel[1].send("Hello! To see a list of commands, run **/helpinventory**.");
	} catch (error) {
		console.log(error);
	}
});

client.on("message", async (message) => {
	if (message.content.split("")[0] !== "/") return;
	if (process.env.PORT && message.guild.name === "Bot Testing") return;
	if (message.channel.type === "dm" && !message.author.bot) {
		const regexTest = /fuck|dick|stupid/.test(message.content); // Hidden easter egg lol
		if (regexTest) return message.author.send(`:poop:僕は悪いボットではないよ！`).catch(console.error);
		else return message.author.send(`Messages to this bot are not monitored. If you have any issues or feature requests, please go to https://github.com/moojigc/DiscordBot/issues.`);
	}
	// stops function if author is the bot itself
	if (message.author === client.user) return;
	const validCommands = {
		commands: ["login", "inventory", "inv", "wallet", "create", "deleteplayer", "helpinventory", "add", "remove", "overwrite", "changelog", "dm"],
		isValid: function (input) {
			return this.commands.map((c) => {
				if (c === input) return true;
				else return false;
			});
		}
	};
	const messageArr = message.content.toLowerCase().split(" "),
		command = messageArr[0].split("").slice(1).join(""),
		commandKeywords = messageArr.slice(1); // used by the if statement
	// End whole script if no valid command entered
	if (!validCommands.isValid(command)) return;
	const { createResponseEmbed } = require("./utils/globalFunctions.js")(message);

	const checkMentionsAndPermissions = () => {
		// Check whether acting upon author of the message or a mentioned user, or @ everyone
		if (message.mentions.users.array().length > 0 || message.mentions.everyone) {
			const nullObject = { id: null, displayName: "@everyone" }; // Prevents errors when getting the inventory of @everyone
			if (!message.member.hasPermission("BAN_MEMBERS") || !message.member.hasPermission("KICK_MEMBERS")) {
				return createResponseEmbed("channel", "invalid", `User <@${message.author.id}> does not have sufficient privileges for this action.`);
			} else
				return {
					args: commandKeywords.slice(1), // accounts for @mention being the 2nd word in the message
					recipientPlayerObject: commandKeywords[0] === "@everyone" ? nullObject : message.mentions.members.first()
				};
		} else {
			return {
				args: commandKeywords.slice(0),
				recipientPlayerObject: message.member // all commands will be carried out on the author of the message
			};
		}
	};
	const { args, recipientPlayerObject } = checkMentionsAndPermissions(),
		recipientPlayerName = recipientPlayerObject.displayName;

	try {
		let currentGuild = await Guild.findOne({ discordId: message.guild.id });
		let currentPlayer = await Player.findOne({ discordId: recipientPlayerObject.id + message.guild.id });
		if (!currentPlayer && command !== "create" && command !== "helpinventory" && recipientPlayerName !== "@everyone") return createResponseEmbed("channel", "invalid", `No data for ${recipientPlayerName}. Run /create to start an inventory for this player.`);
		switch (command) {
			case `inv`:
			case `inventory`:
				const { showInventory } = require("./commands/inv_wallet")(message);
				await showInventory(currentPlayer, currentGuild.players);
				break;
			case `wallet`:
				const { showWallet } = require("./commands/inv_wallet")(message);
				await showWallet(currentPlayer, currentGuild.players);
				break;
			case `add`:
				const { add } = require("./commands/add");
				currentPlayer.inventory = add(message, args, currentPlayer).inventory;
				currentPlayer.writeChangelog(message.content);
				await currentPlayer.updateOne({
					inventory: currentPlayer.inventory,
					changelog: currentPlayer.changelog,
					lastUpdated: Date.now()
				});

				break;
			case `remove`:
				const removeItem = require("./commands/remove");
				currentPlayer.inventory = removeItem(message, args, currentPlayer).inventory;
				currentPlayer.writeChangelog(message.content);
				await currentPlayer.updateOne({
					inventory: currentPlayer.inventory,
					changelog: currentPlayer.changelog,
					lastUpdated: Date.now()
				});

				break;
			case `overwrite`:
				const overwrite = require("./commands/overwrite");
				currentPlayer.inventory = overwrite(message, args, currentPlayer).inventory;
				currentPlayer.writeChangelog(message.content);
				await currentPlayer.updateOne({
					inventory: currentPlayer.inventory,
					changelog: currentPlayer.changelog,
					lastUpdated: Date.now()
				});

				break;
			case `create`:
				if (currentPlayer) return createResponseEmbed("channel", "invalid", `This user already has an inventory set up!`);
				let [prepack, gold, silver, copper, DMsetting] = args;
				let notificationsToDM = DMsetting === "DM" || DMsetting === "dm" ? true : false;
				let createResponse;
				let player = new Player({
					name: recipientPlayerName,
					discordId: recipientPlayerObject.id + message.guild.id,
					guildId: message.guild.id,
					guild: message.guild.name,
					notificationsToDM: notificationsToDM
				});
				player.writeChangelog(message.content);
				if (prepack === "prepack") {
					player.createInventory("prepack", gold, silver, copper);
					createResponse = await player.save();
				} else {
					player.createInventory();
					createResponse = await player.save();
				}
				if (createResponse) createResponseEmbed("channel", "success", `Created ${recipientPlayerName}'s inventory!`, currentPlayer);
				else createResponseEmbed("channel", "invalid", "Sorry, there was an error with the database server. Please try again.", currentPlayer);

				break;
			case `deleteplayer`:
				await currentPlayer.remove();
				createResponseEmbed("channel", "success", `Player ${recipientPlayerName}'s inventory successfully deleted.`);

				break;
			case `dm`:
				const dm = require("./commands/dm");
				currentPlayer.notificationsToDM = dm(message, currentPlayer).notificationsToDM;
				currentPlayer.writeChangelog(message.content);
				await currentPlayer.updateOne({
					notificationsToDM: currentPlayer.notificationsToDM,
					changelog: currentPlayer.changelog,
					lastUpdated: Date.now()
				});

				break;
			case `helpinventory`:
				const help = require("./commands/help");
				help(message);
				break;
			case `changelog`:
				const changelog = require("./commands/changelog");
				changelog(message, currentPlayer, moment);
				break;

			case `login`:
				const webLogin = require("./commands/login");
				webLogin(message, currentPlayer);
				break;

			default:
				// Keep blank so the bot doesn't interfere with other bots
				return;
		}
	} catch (err) {
		console.trace(err);
		let errorEmbed = new MessageEmbed()
			.setColor("RED")
			.setTitle(`Something went wrong!`)
			.setDescription(
				`Hi **${message.author.username}**, 
            You tried to execute: \`${message}\` but it returned the following error.`
			)
			.addField(
				"Problem:",
				`\`${err}\`.
            If you did not get any other error messages describing the issue in plain English, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`
			)
			.addField("At:", moment().format("MMMM Do, hh:mm a"));

		if (!message.author.bot) message.author.send(errorEmbed);
	}
});
// end of client.on('message)
client.login(BOT_TOKEN);
