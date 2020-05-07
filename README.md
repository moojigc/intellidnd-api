# DnD Inventory Bot Guide
A simple Discord Bot that manages inventory for D&D campaigns.

Commands are *not* case sensitive, neither are inventory items. However, they will still appear capitalized.

Members with kick/ban permission can run commands on other users by *@mentions* immediately after the command.
For example, **/add @tomNook gold 1000** will add 1000 gold to @tomNook. This works for every command.

Invite to your server: https://discordapp.com/api/oauth2/authorize?client_id=692109220371365989&permissions=134309888&scope=bot.

## /create
This command creates your inventory and all fields will be empty or 0 by default.
This bot uses nicknames as the player names, not the user's regular Discord username.

## /create prepack gold# silver# DM/channel
This will prepack inventory with `crowbar, hammer, pitons x10, torches x10, rations x10, feet of hempen rope x100.`

**/create prepack 100 10 DM** will set `gold to 100`, `silver to 10`, `DMs on`. If DM is not specified, they will be off by default.

## /inventory, /inv
Displays your own inventory. Adding a category
plus a value (e.g. /inventory gold 100) will update your inventory.
Mods/admins can use /inventory everyone to see all inventories. Currently, @everyone does not work.

## /add *category*
Adds new items to specified category. Supports lists of items, and quantity, but not both at the same time.
e.g. **/add gold 50** adds 50 to gold, **/add potions Health 2** will add Health x2, and **/add potions Health, Poison** will add Health and Poison.
/create
This command creates your inventory and all fields will be empty or 0 by default.
This bot uses nicknames as the player names, not the user's regular Discord username.

## /remove *category*
Removes specified item or amount from the category.
For example, **/remove weapons Net** will remove Net from weapons.

## /dm
**/dm on** will send all notifications from the bot to your DMs. **/dm off** will send them to the channel.
Set individually per user. DMs are off by default.

## /overwrite
This command overwrites EVERYTHING in the specified category. For example, **/overwrite weapons sword**
will delete all your weapons and set the Sword as your only weapon. Use with care.

## /deleteplayer
Deletes your entire inventory and changelog.
Use with care.

## Money
When dealing with money, there are 3 possible commands.
**/overwrite gold 50** will overwrite any previous amount and hardcode your current gold to 50.
**/add gold 50** will add to the current amount.
**/remove gold 50** will subtract from the current amount.

## Support
If you find a bug or have any suggestions for additional features, please submit a ticket at https://github.com/moojigc/DiscordBot/issues.

## Your Data
This bot uses a secure MongoDB database to store your inventory information. Additionally, it stores your unique Discord user ID plus the server's ID (both are just random integers) in order to match each player with their inventory. It also stores all user IDs from a given server. You can have one inventory per Discord server.

No sensitive data, like passwords, are stored. It does not store usernames (unless you do not have a nickname set up).
