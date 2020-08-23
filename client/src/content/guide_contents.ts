export default {
	description:
		'Commands are *not* case-sensitive. Members with kick/ban permission can run commands on other users by **@mentions** immediately after the command. For example, **/add @tomNook gold 1000** will add 1000 gold to @tomNook. This works for every command.',
	commands: [
		{
			name: '/stat, /stats',
			example: '> `/stat charisma 16`',
			explanation: [
				`Use this command to modify your characters' stats. If you use the \`create\` command, all will be 10 by default.`,
				'`/stat` by itself will display your characters stats for you',
			],
		},
		{
			name: '/d, /dice',
			example: '> `/d 1d20, /dice d20+3d7+5`',
			explanation: [
				`Either /d or /dice will work. Separate different rolls with a plus sign (+), and you can also add modifiers.`,
				`> \`/d persuasion, /d charisma\` - If you set your character's stats, rolling for a particular skill or stat will automatically roll 1d20 plus the correct modifier.`,
			],
		},
		{
			name: '/inventory, /inv',
			explanation: [`Displays your own inventory.`],
		},
		{
			name: '/add *category*',
			explanation: [
				'Adds new items to specified category. Supports lists of items, and quantity, but not both at the same time.',
				'e.g., `/add gold 50` adds 50 to gold, `/add potions Health 2` will add Health x2, and `/add potions Health, Poison` will add Health and Poison.',
			],
		},
		{
			name: '/create',
			explanation: [
				`This command creates your character with an empty inventory. I recommend running /create then /login and use the website for initial setup. This bot will set your nickname in the server as the player name, or your username if you do not have a nickname set.`,
			],
		},
		{
			name: '/create prepack gold# silver# DM',
			example: '> `/create prepack 100 10 1 dm`',
			explanation: [
				'This will generate a character that has 100 gold, 10 silver, 1 copper, and the bot will send you direct messages instead of in-channel replies (which is the default behaviour). This will also prepack your inventory with `crowbar, hammer, pitons x10, torches x10, rations x10, feet of hempen rope x100`.',
			],
		},
		{
			name: '/remove *category*',
			example:
				'> `/remove weapons net` will remove 1 Net from weapons. `/remove weapons net 5` will remove 5 Nets.',
			explanation: [
				'Removes specified item or amount from the category. Also supports comma-separated lists.',
			],
		},
		{
			name: '/dm',
			explanation: [
				`**/dm on** will send all notifications from the bot to your DMs. **/dm off** will send them to the channel. Set individually per user. DMs are off by default.`,
			],
		},
		{
			name: '/overwrite',
			example: '> `/overwrite weapons sword`',
			explanation: [
				'This example will delete your weapons category and replace it with Sword x1. This command overwrites EVERYTHING in the specified category. Use with care.',
			],
		},
		{
			name: '/deleteplayer',
			explanation: [
				`Deletes your entire inventory and changelog. *Use with care!*`,
			],
		},
		{
			name: 'Money',
			explanation: [
				'When dealing with money, there are 3 possible commands.',
				'> `/overwrite gold 50` will overwrite any previous amount and hardcode your current gold to 50.',
				'> `/add gold 50` will add to the current amount.',
				'> `/remove gold 50` will subtract from the current amount.',
			],
		},
		{
			name: '/login',
			explanation: [
				`You can login/register to view and edit your inventory on the IntelliDnD website: https://www.intellidnd.com/.`,
			],
		},
		{
			name: 'Support',
			explanation: [
				`If you find a bug or have any suggestions for additional features, please submit a ticket at https://github.com/moojigc/DiscordBot/issues.`,
			],
		},
		{
			name: 'Your Data',
			explanation: [
				`What data from Discord does this bot store? \n- Your Discord user ID \n- Your Discord server's ID \n- Your nickname in that server (defaults to username) \n- The last 25 commands you gave the bot`,
			],
		},
	],
};
