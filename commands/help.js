const { MessageEmbed } = require("discord.js");

const help = async (message) => {
	let helpEmbed = new MessageEmbed()
		.setTitle("DnD Inventory Bot Guide")
		.setDescription(
			`Commands are *not* case-sensitive. 
        Members with kick/ban permission can run commands on other users by **@mentions** immediately after the command.
        For example, **/add @tomNook gold 1000** will add 1000 gold to @tomNook. This works for every command.`
		)
		.addFields(
			{
				name: "/inventory, /inv",
				value: `Displays your own inventory. Adding a category
            plus a value (e.g. **/inventory gold 100**) will update your inventory.
            Members with kick/ban permission can use **/inventory @everyone** to see all inventories.`
			},
			{
				name: "/add *category*",
				value: `Adds new items to specified category. Supports lists of items, and quantity, but not both at the same time.
            e.g. **/add gold 50** adds 50 to gold, **/add potions Health 2** will add Health x2, and **/add potions Health, Poison** will add Health and Poison.`
			},
			{
				name: "/create",
				value: `This command creates your inventory and all fields will be empty or 0 by default.
            This bot uses nicknames as the player names, not the user's regular Discord username.`
			},
			{
				name: "/create prepack gold# silver# DM",
				value: `This will prepack inventory with **crowbar, hammer, pitons x10, torches x10, rations x10, feet of hempen rope x100**.
            **/create prepack 100 10 DM** set gold to 100, silver to 10, DMs on. If *DM* is not typed in, DMs will be off by default.`
			},
			{
				name: "/remove *category*",
				value: `Removes specified item or amount from the category.
            For example, **/remove weapons net** will remove Net from weapons.`
			},
			{
				name: "/dm",
				value: `**/dm on** will send all notifications from the bot to your DMs. **/dm off** will send them to the channel.
            Set individually per user. DMs are off by default.`
			},
			{
				name: "/overwrite",
				value: `This command overwrites EVERYTHING in the specified category. For example, **/overwrite weapons Sword**
            will delete all your weapons and set the Sword as your only weapon. Use with care.`
			},
			{
				name: "/deleteplayer",
				value: `Deletes your entire inventory and changelog.
            Use with care.`
			},
			{
				name: "Money",
				value: `When dealing with money, there are 3 possible commands. 
            **/overwrite gold 50** will overwrite any previous amount and hardcode your current gold to 50.
            **/add gold 50** will add to the current amount.
            **/remove gold 50** will subtract from the current amount.`
			},
			{
				name: "/login",
				value: `Use this to get a link to login to this bot's website, where you can interact with your inventory through a graphic interface.`
			},
			{
				name: "Support",
				value: `If you find a bug or have any suggestions for additional features, please submit a ticket at https://github.com/moojigc/DiscordBot/issues.`
			},
			{
				name: "Your Data",
				value: `This bot uses a secure MongoDB database to store your inventory data. 
            In addition, it stores your numerical user ID and Guild ID from Discord in order to match you with your inventory, as well as give you access to your inventory through the website with */login*. You can have one inventory per Discord server.
            No sensitive data, like passwords, are stored.`
			}
		)
		.setURL("https://github.com/moojigc/DiscordBot")
		.setColor("#9B59B6")
		.setFooter("Both author: Moojig Battsogt");
	message.channel.send(helpEmbed);
};

module.exports = help;
