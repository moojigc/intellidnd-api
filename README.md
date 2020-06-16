# IntelliDnD

A simple Discord Bot that manages inventory for D&D campaigns, accompanied by a [website](https://dnd-inventory-bot.herokuapp.com) that you can also use to interact with your data.

Invite to your server: https://discordapp.com/api/oauth2/authorize?client_id=692109220371365989&permissions=134309888&scope=bot.

<img src="https://www.intellidnd.com/assets/images/primary-logo-sm.png" width="75px">

## Bot Commands

Commands are _not_ case sensitive.

Members with at least **kick/ban permission** can run commands on other users by _@mentions_ immediately after the command.
For example, **/add @tomNook gold 1000** will add 1000 gold to @tomNook. This works for every command.

### /create

This command creates your character with an empty inventory. I recommend running `/create` then `/login` and use the website for initial setup.

This bot will set your nickname in the server as the player name, or your username if you do not have a nickname set.

### /create prepack gold# silver# copper# DM/channel

`Ex: /create prepack 100 10 1 dm` will generate a character that has **100 gold, 10 silver, 1 copper**, and the bot will send you **direct messages** instead of in-channel replies (which is the default behaviour).

This will also prepack your inventory with `crowbar, hammer, pitons x10, torches x10, rations x10, feet of hempen rope x100.`

### /inventory, /inv

Displays your own inventory.

Members with elevated permissions can use **/inventory @everyone** to see all inventories.

### /add _category_

> `Ex: /add potions healing 2` will add two healing potions to your potions category.

Adds new items to specified category. Supports lists of items, and quantity, but not both at the same time.
e.g. **/add gold 50** adds 50 to gold, **/add potions Health 2** will add Health x2, and **/add potions Health, Poison** will add Health and Poison.
/create

### /remove _category_

> Ex: `/remove weapons net` will remove 1 Net from weapons. `/remove weapons net 5` will remove 5 Nets.

Removes specified item or amount from the category. Also supports comma-separated lists.

### /dm

**/dm on** will send all notifications from the bot to your DMs. **/dm off** will send them to the channel.
Set individually per user. DMs are off by default.

### /overwrite

> Ex:`/overwrite weapons sword` will delete your weapons category and replace it with Sword x1.

This command overwrites EVERYTHING in the specified category. _Use with care._

### /deleteplayer

Deletes your entire inventory and changelog.
_Use with care._

### /login

You can login/register to view and edit your inventory on the D&D Inventory website: https://dnd-inventory-bot.herokuapp.com.

### Money

When dealing with money, there are 3 possible commands.

> `/overwrite gold 50` will overwrite any previous amount and hardcode your current gold to 50.

> `/add gold 50` will add to the current amount.

> `/remove gold 50` will subtract from the current amount.

### Support

If you find a bug or have any suggestions for additional features, please submit a ticket at https://github.com/moojigc/DiscordBot/issues.

### Your Data

What data from Discord does this bot store?

-   Your Discord user ID
-   Your Discord server's ID
-   Your nickname in that server (just your Discord username if you don't use a nickname)
-   The last 20 commands you gave the bot
