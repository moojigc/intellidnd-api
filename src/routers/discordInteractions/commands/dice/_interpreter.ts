const diceRegex = /([\+|-])?(\d+)?d\d+/g;
function _parse(s: string) {

    let int = s.split(/,|\./).map(s => s.trim()).join('');

    int += /\d/.test(int) ? '' : '1';

    return parseInt(int);
}

export default function interpreter(input: string) {

    const rolls = input.match(diceRegex)?.map(s => s.split(/d/i).map(_parse));
    const [raw, label] = input.split(/#/).map(s => s.trim());
    const modifiers = raw.split(/(?=[\+-])/)
        .filter(f => {

            if (!/d/.test(f)) {

                console.log(f)

                return !isNaN(parseInt(f));
            }
        })
        .map(n => parseInt(n));
    
    const keepM = raw.match(/kh|kl/i);
    const [keep] = keepM ? keepM : [];
    
    const rollTypes = {
        disadvantage: /dis/.test(raw),
        advantage: /adv/.test(raw),
    };
    
    let dice: number[] = [], sides: number[] = [], keepAmount = 0;

    for (const r of rolls!) {

        if (r[0] < 0) { r[1] = -(r[1] || 1); }
        
        dice.push(Math.abs(r[0]) || 1);
        sides.push(r[1] || 1);
    }

    if (keep) {

        keepAmount = parseInt(raw.split(/kh|kl/i)[1]) || 1;
    }
    else if (rollTypes.advantage || rollTypes.disadvantage) {
        
        const totalDice = dice.reduce((c, v) => c + v, 0);
        keepAmount = totalDice;
        dice = dice.map(d => d * 2);
    }

    return {
        bigInts: {
            dice: dice.filter(d => !Number.isSafeInteger(d)).length,
            sides: sides.filter(d => !Number.isSafeInteger(d)).length
        },
        keep: {
            disadvantage: rollTypes.disadvantage,
            advantage: rollTypes.advantage,
            high: /h|adv/i.test(raw),
            low: /l|dis/i.test(raw),
            amount: keepAmount
        },
        dice: dice,
        sides,
        raw,
        label,
        modifiers
    };
}