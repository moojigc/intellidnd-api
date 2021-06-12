import type { InteractionPayload } from '../../types';

import seedRandom from 'seedrandom';
import random from 'random';

const _a = (a: number, b: number) => a + b;

export default function roll({
    dice,
    sides,
    raw,
    label,
    modifiers,
    keep
}: {
    dice: number[];
    sides: number[];
    raw: string;
    label: string;
    modifiers: number[];
    keep: {
        disadvantage: boolean;
        advantage: boolean;
        high: boolean;
        low: boolean;
        amount: number;
    };
}, payload: InteractionPayload) {

    const d = new Date();
    random.use(seedRandom(d.toString() + (d.getTime()/64).toString()));
    
    const results: number[] = [];
    const totals = {
        modifier: modifiers.reduce(_a, 0),
        dice: dice.reduce(_a, 0),
        sides: sides.reduce((a, b) => a + Math.abs(b), 0)
    };

    for (const index in dice) {

        const r = dice[index];

        for (let j = 0; j < r; j++) {

            let result = random.int(1, Math.abs(sides[index]));

            if (sides[index] < 0) {

                result = -result;
            }

            results.push(result);
        }
    }

    if (Object.values(keep).filter(v => v === true).length) {

        results.sort((a, b) => keep.high ? a - b : b - a);
    }

    const amountToRemove = results.length - keep.amount;
    
    let removed = 0;
    let max = totals.modifier || 0;
    let total = totals.modifier || 0;
    const interpretedRolls: ({
        remove: boolean;
        value: number;
    })[] = [];

    for (let i = 0; results[i]; i++) {

        if (keep.amount && removed < amountToRemove) {

            removed++;

            interpretedRolls.push({
                remove: true,
                value: results[i]
            });

            continue;
        }

        max += totals.sides;
        total += results[i];

        interpretedRolls.push({
            remove: false,
            value: results[i]
        });
    }

    return {
        interpretedRolls,
        dice,
        sides,
        modifiers,
        total,
        label,
        /**
         * epic times
         */
        crit: total === max,
        /**
         * sad times
         */
        oof: total <= 1 && max > 5,
        rawInput: raw,
        guildId: payload.guild_id,
        userId: payload.member.user.id,
    };
}