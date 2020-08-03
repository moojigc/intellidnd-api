import { Message, GuildMember } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';
import utils from '../utils';

const dexRolls = {
    regExp: /acro(batics)?|ste(alth?)|sleight(\s?of\s?hand)?|dex(terity)?|init(iative)?/i,
    property: 'dexterity'
};
const wisRolls = {
    regExp: /animal(s?\s?handling)?|insight|med(icine)?|perc(eption)?|surv(ival)?|wis(dom)?/i,
    property: 'wisdom'
};
const intRolls = {
    regExp: /arca(na)?|hist(ory)?|nat(ure)?|rel(igion)?|intel(ligence)?/i,
    property: 'intelligence'
};
const chaRolls = {
    regExp: /decep(tion)?|intim(idation)?|perf(ormance)?|pers(uasion)?|char(isma)?/i,
    property: 'charisma'
};
const strRolls = { regExp: /athletics|str(ength)?/i, property: 'strength' };
export const rollRegexes = [dexRolls, wisRolls, intRolls, chaRolls, strRolls];

interface RollParams {
    message: Message;
    player: IPlayer;
    discordMember: GuildMember | { id: string; displayName: string };
    args: string[];
}

/**
 * Do a roll!
 */
const roll = ({ message, player, discordMember, args }: RollParams) => {
    const { createResponseEmbed } = utils(message);
    const isSavedRoll = (input: string) =>
        rollRegexes.filter(({ regExp }) => regExp.test(input)).length > 0 && !/#/.test(input);
    /**
     * Using regexes, this deconstructs the roll, modifiers and roll label from user input
     */
    const getRollDetails = (args: string[]) => {
        if (isSavedRoll(args.join(' '))) {
            let [savedRoll] = args;
            let [{ property }] = rollRegexes.filter(({ regExp }) => regExp.test(savedRoll));
            let mod = player ? Math.floor((player[property] - 10) / 2) : 0;
            return {
                modifiers: mod !== 0 ? [mod] : [],
                rollName: savedRoll,
                rolls: ['1d20'],
                noPlayerData: !!player
            };
        } else {
            let stringified = args.join(' ');
            // Split the string starting from first character matching either a number or the letter d, and then
            // set delimiter to + OR -, and include them in the result
            let rolls = stringified
                .substring(stringified.search(/[0-9]|d/i))
                .split(/(?=-)|(?=\+)|#/);
            // This regex checks for a string in the format of number + d + number
            let rollRegex = /(\d+)?d\d+/i;
            return {
                modifiers: rolls
                    .filter((r) => {
                        return !r.match(rollRegex) && Number(r) !== NaN;
                    })
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
	
	if (modifiers.filter(m => m === NaN).length > 0) return message.channel.send("One or more modifiers is not a number.");

    // If user tries to enter in a saved roll but doesn't have a player setup
    if (noPlayerData)
        return createResponseEmbed(
            'channel',
            'invalid',
            `No saved rolls found for ${discordMember.displayName}! Try \`/create\`.`
        );
    if (rolls.length === 0)
        // Ends func if no rolls, usually as a result of user inputting wrong syntax and regexes failed
        return message.channel.send(':poop:');

    let totalRaw = rolls
        .map((roll) => {
            // If user types in 1d20, then dice = 1 and sides = 20
            let [dice, sides] = roll.split(/d/i).map((r) => (r ? parseInt(r) : 1));
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
                `\`${rolls.join('+')}${readableModifiers.join('')}${
                    rollName ? ' #' + rollName : ''
                }\`: (` +
                totalRaw.join(' + ') +
                `) ${readableModifiers2.join('')} ` +
                `= **${
                    totalRaw.reduce((pv, cv) => pv + cv, 0) +
                    modifiers.reduce((pv, cv) => pv + cv, 0)
                }**`
            );
        } else if (totalRaw.length > 1 && modifiers.length === 0) {
            return (
                `\`${rolls.join('+')}${rollName ? ' #' + rollName : ''}\`: (` +
                totalRaw.join(' + ') +
                `) = **${totalRaw.reduce((pv, cv) => pv + cv, 0)}**`
            );
        } else {
            return `\`${rolls[0]}${rollName ? ' #' + rollName : ''}\`: **${totalRaw[0]}**`;
        }
    };
    if (!message) {
        return reply;
    } else {
        if (args.join(' ').match(/-s/i))
            message.channel.send(
                `<@${discordMember.id}>: ${totalRaw.reduce((pv, cv) => pv + cv, 0)}`
            );
        else message.channel.send(`<@${discordMember.id}> rolled ${reply()}!`);
    }
};

export default roll;