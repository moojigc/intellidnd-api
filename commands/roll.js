const dexRolls = {
	regExp: /acro(batics)?|stealth|sleight(\s?of\s?hand)?|dex(terity)?/i,
	property: "dexterity"
};
const wisRolls = {
	regExp: /animal(s?\s?handling)?|insight|med(icine)?|perc(eption)?|surv(ival)?|wis(dom)?/i,
	property: "wisdom"
};
const intRolls = {
	regExp: /arcana|hist(ory)?|nat(ure)?|rel(igion)?|intel(ligence)?/i,
	property: "intelligence"
};
const chaRolls = {
	regExp: /decep(tion)?|intim(idation)?|perf(ormance)?|pers(uasion)?|char(isma)?/i,
	property: "charisma"
};
const strRolls = { regExp: /athletics|str(ength)?/i, property: "strength" };
const rollRegexes = [dexRolls, wisRolls, intRolls, chaRolls, strRolls];
// @ts-check
/**
 * Do a roll!
 * @param {Object} options
 * @param {import("discord.js").Message} options.message
 * @param {import("../models/Player")} options.player
 * @param {import("discord.js").GuildMember | { id: string, displayName: string }} options.discordMember
 * @param {string[]} options.args
 */
const roll = ({ message, player, discordMember, args }) => {
	const { createResponseEmbed } = require("../utils/globalFunctions")(message);
	// @ts-ignore
	const isSavedRoll = (input) =>
		rollRegexes.filter(({ regExp }) => regExp.test(input)).length > 0 ? true : false;
	/**
	 * Using regexes, this deconstructs the roll, modifiers and roll label from user input
	 * @param {string[]} args
	 */
	const getRollDetails = (args) => {
		if (isSavedRoll(args.join(" "))) {
			let [savedRoll] = args;
			let [{ property }] = rollRegexes.filter(({ regExp, property }) =>
				regExp.test(savedRoll)
			);
			let mod = player ? Math.floor((player[property] - 10) / 2) : 0;
			console.log(mod);
			return {
				modifiers: mod !== 0 ? [mod] : [],
				rollName: savedRoll,
				rolls: ["1d20"],
				noPlayerData: player ? false : true
			};
		} else {
			let stringified = args.join(" ");
			// Split the string starting from first character matching either a number or the letter d, and then
			// set delimiter to + OR -, and include them in the result
			let rolls = stringified.substring(stringified.search(/[0-9]|d/i)).split(/(?=-)|(?=\+)/);
			// This regex checks for a string in the format of number + d + number
			let rollRegex = /(\d+)?d\d+/i;
			return {
				modifiers: rolls
					// @ts-ignore
					.filter((r) => !r.match(rollRegex) && !isNaN(r))
					.map((r) => parseInt(r)),
				rolls: rolls
					.map((r) => {
						let match = r.match(rollRegex);
						return match ? match[0] : null;
					})
					.filter((r) => !!r),
				rollName: stringified.split(/#/)[1]
			};
		}
	};
	let { rollName, rolls, modifiers, noPlayerData } = getRollDetails(args);

	// If user tries to enter in a saved roll but doesn't have a player setup
	if (noPlayerData)
		return createResponseEmbed(
			"channel",
			"invalid",
			`No saved rolls found for ${discordMember.displayName}! Try \`/create\`.`
		);
	if (rolls.length === 0)
		// Ends func if no rolls, usually as a result of user inputting wrong syntax and regexes failed
		return message.channel.send(":poop:");

	let totalRaw = rolls
		.map((roll) => {
			// If user types in 1d20, then dice = 1 and sides = 20
			let [dice, sides] = roll.split("d").map((r) => (r ? parseInt(r) : 1));
			// Returns a random roll with any amount of dice
			let totalRolls = [];
			for (let i = 0; i < dice; i++) {
				totalRolls.push(Math.floor(Math.random() * sides + 1));
			}
			return totalRolls;
		})
		.reduce((prev, curr) => {
			return prev.concat(curr);
		}, []);

	// Returns a formatted string
	const reply = () => {
		let readableModifiers = modifiers.map((m) => (m > 0 ? `+${m}` : m));
		let readableModifiers2 = modifiers.map((m) => (m > 0 ? `+ ${m} ` : `- ${m * -1} `));
		if (modifiers.length > 0) {
			return (
				`\`${rolls.join("+")}${readableModifiers.join("")}${
					rollName ? " #" + rollName : ""
				}\`: (` +
				totalRaw.join(" + ") +
				`) ${readableModifiers2.join("")} ` +
				`= **${
					totalRaw.reduce((pv, cv) => pv + cv, 0) +
					modifiers.reduce((pv, cv) => pv + cv, 0)
				}**`
			);
		} else if (totalRaw.length > 1 && modifiers.length === 0) {
			return (
				`\`${rolls.join("+")}${rollName ? " #" + rollName : ""}\`: (` +
				totalRaw.join(" + ") +
				`) = **${totalRaw.reduce((pv, cv) => pv + cv, 0)}**`
			);
		} else {
			return `\`${rolls[0]}${rollName ? " #" + rollName : ""}\`: **${totalRaw[0]}**`;
		}
	};
	if (!message) {
		return reply;
	} else {
		if (args.join(" ").match(/-s/i))
			message.channel.send(
				`<@${discordMember.id}>: ${totalRaw.reduce((pv, cv) => pv + cv, 0)}`
			);
		else message.channel.send(`<@${discordMember.id}> rolled ${reply()}!`);
	}
};

module.exports = { roll, rollRegexes };
