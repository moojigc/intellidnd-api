import dotenv from "dotenv";
dotenv.config();
import { Client, MessageEmbed, TextChannel } from "discord.js";
import moment from "moment";
import { Player, Guild } from "../server/models";
import { connect } from "mongoose";
const client = new Client({ disableMentions: "everyone" });
import utils, { checkPermissions, returnConditionsMet } from "./utils";
import {
	add,
	changelog,
	invWallet,
	create,
	dm,
	help,
	setStats,
	webLogin,
	roll,
	overwrite,
	remove,
} from "./commands";

connect(process.env.MONGODB_URI || "mongodb://localhost/dnd-inventory", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
}).catch(console.error);

client.once("ready", async () => {
	console.log(`${client.user.username} is ready!`);
	try {
		let link = await client.generateInvite([
			"MANAGE_MESSAGES",
			"SEND_MESSAGES",
			"READ_MESSAGE_HISTORY",
			"EMBED_LINKS",
		]);
		console.log(link);
	} catch (e) {
		console.error(e);
	}
});

// Sends message upon invite to a guild
client.on("guildCreate", async (guild) => {
	try {
        // Filters for the first text channel the bot has permission to send messages in
		let [firstTextChannel] = guild.channels.cache.filter((c) =>
			c.permissionsFor(guild.me).has("SEND_MESSAGES") && c.type === 'text'
        );
        if (!firstTextChannel) return;
		let channel = new TextChannel(guild, { id: firstTextChannel[1].id });
		channel.send(
			"Hello! To see a list of commands, run **/intellidnd**."
		);
	} catch (error) {
		console.error(error);
	}
});

client.on("message", async (message) => {
	try {
        if (returnConditionsMet(message)) return;
		const command = message.content
				.toLowerCase()
				.split("/")[1]
				?.split(" ")[0],
			{ createResponseEmbed } = utils(message),
			{ args, recipientPlayer, insufficientPerms } = checkPermissions(
				message
			);
		if (insufficientPerms)
			return createResponseEmbed(
				"channel",
				"invalid",
				`User <@${message.author.id}> does not have sufficient privileges for this action.`
			);
		let currentGuild = await Guild.findOne({ discordId: message.guild.id });
		let currentPlayer = await Player.findOne({
			discordId: recipientPlayer.id + message.guild.id,
		});
		// commands usable by anyone
		const allUserCommands = (input: string) =>
			/create|intellidnd|dice|d/.test(input);
		if (
			!currentPlayer &&
			!allUserCommands(command) &&
			recipientPlayer.displayName !== "@everyone"
		)
			return createResponseEmbed(
				"channel",
				"invalid",
				`No data for ${recipientPlayer.displayName}. Run \`/create\` to start an inventory for this player.`
			);
		// Auto change names
		if (
			currentPlayer &&
			currentPlayer.name !== recipientPlayer.displayName
		) {
			await Player.updateOne(
				{ discordId: recipientPlayer.id + message.guild.id },
				{ name: recipientPlayer.displayName }
			);
		}
		switch (command) {
			case `inv`:
			case `inventory`:
				{
					await invWallet(message).showInventory(
						currentPlayer,
						currentGuild
					);
				}

				break;
			case `wallet`:
				{
					await invWallet(message).showWallet(currentPlayer, currentGuild);
				}

				break;
			case `add`:
				{
					await currentPlayer.updateOne({
						inventory: add(message, args, currentPlayer).inventory,
						changelog: currentPlayer.writeChangelog(
							message.content
						),
						lastUpdated: new Date(),
					});
				}

				break;
			case `remove`:
				{
					await remove(message, args, currentPlayer);
				}

				break;
			case `overwrite`:
				{
					await overwrite(message, args, currentPlayer);
				}

				break;
			case `create`:
				{
					await create({
						Player: Player,
						Guild: Guild,
						currentGuild: currentGuild,
						currentPlayer: currentPlayer,
						args: args,
						recipientPlayer: recipientPlayer,
						message: message,
					});
				}

				break;
			case `deleteplayer`:
				{
					await currentPlayer.remove();
					await currentGuild.updateOne({
						$pull: {
							players: currentPlayer._id,
						},
					});
					await createResponseEmbed(
						"channel",
						"success",
						`Player ${recipientPlayer.displayName}'s inventory successfully deleted.`
					);
				}

				break;
			case `dm`:
				{
					await dm(message, currentPlayer);
				}

				break;
			case `helpinventory`:
			case `intellidnd`:
				{
					help(message);
				}
				break;
			case `changelog`:
				{
					await changelog(message, currentPlayer, moment);
				}
				break;
			case `login`:
				{
					await webLogin(message, currentPlayer);
				}
				break;
			case `d`:
			case `dice`:
				{
					await roll({
						message: message,
						player: currentPlayer,
						discordMember: recipientPlayer,
						args: args,
					});
				}
				break;
			case `stats`:
			case `stat`:
				{
					await setStats(message, args, currentPlayer);
				}
				break;
			default:
				// Keep blank so the bot doesn't interfere with other bots
				return;
		}
	} catch (err) {
		console.error(err);
		let errorEmbed = new MessageEmbed()
			.setColor("RED")
			.setTitle(`Something went wrong!`)
			.setDescription(
				`Hi **${message.author.username}**,\nYou tried to execute: \`${message.content}\` but it returned the following error.`
			)
			.addField(
				"Problem:",
				`\`${err}\`.\nIf you did not get any other error messages describing the issue in plain English, please submit this one to the [bot's GitHub repo](https://github.com/moojigc/DiscordBot/issues).`
			)
			.addField("At:", moment(message.createdTimestamp).format("MMMM Do, hh:mm a"));

		if (!message.author.bot) message.author.send(errorEmbed);
	}
});
// end of client.on('message)
client.login(process.env.BOT_TOKEN);
