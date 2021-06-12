import { Data } from '../../types';
import format from './format';
import getRoll from './roll';
import interpreter from './_interpreter';

export default async function(input: string, { payload, db, options, defaultArg }: Data) {

    const now = Date.now();
    const isMultiArg = payload.data.name === 'x';

    let isSavedRoll = false;
    let name: string;
    let interpreted: ReturnType<typeof interpreter>;

    if (isMultiArg) {

        if (options.name && Object.keys(options).length === 1) {

            isSavedRoll = true;
        }

        for (const f in defaultArg) {

           options[f] ??= defaultArg[f];
        }

        name = options.name;
        input = options.dice + 'd' + options.sides + (name ? `#${name}` : '');

        if (options.modifier) {
            
            input += ((Number(options.modifier) > 0)
                ? '+' + Math.abs(options.modifier)
                : '-' + Math.abs(options.modifier));
        }
    }
    
    if (!/(\d)?d\d/i.test(input) && !isMultiArg) {

        isSavedRoll = true;
        name = input;
    }
    else {

        interpreted = interpreter(input);

        if (interpreted.bigInts.dice || interpreted.bigInts.sides) {

            return `Sorry, I can't do any numbers bigger than ${Number.MAX_SAFE_INTEGER.toLocaleString()} (9 quadrillion).`;
        }

        name ??= interpreted.label;
    }

    if (isSavedRoll) {
        
        const existingRoll = await db.Roll.get(name, payload.member.user.id, payload.guild_id);

        if (!existingRoll) {
    
            return 'No roll for `' + (name || input) + '` found, or bad roll syntax used.'
        }

        interpreted = interpreter(existingRoll.input);
    }

    const roll = getRoll(interpreted!, payload);
    const { member: { user: { id: userId } }, guild_id: guildId } = payload;

    if (name && !isSavedRoll) {

        db.Roll.upsert({
            name: name,
            lastRolledAt: now,
            input: interpreted!.raw,
            discordUserId: userId,
            guildId: guildId,
        });
    }

    return format({
        input: interpreted!.raw,
        label: name,
        modifiers: interpreted!.modifiers,
        disadvantage: interpreted!.keep.disadvantage,
        advantage: interpreted!.keep.advantage,
        oof: roll.oof,
        total: roll.total,
        userId: userId,
        crit: roll.crit,
        rolls: roll.interpretedRolls,
        maxDicePrint: parseInt(process.env.MAX_DICE_PRINT!)
    });
}