export default function({
    rolls,
    disadvantage,
    advantage,
    modifiers,
    userId,
    input,
    total,
    label,
    crit,
    oof,
    maxDicePrint
}: {
    rolls: ({ remove: boolean; value: number; })[];
    disadvantage: boolean;
    advantage: boolean;
    modifiers: number[];
    userId: string;
    input: string;
    total: number;
    label?: string;
    crit?: boolean;
    oof?: boolean;
    maxDicePrint?: number;
}) {

    let str = '(';

    for (let i = 0; rolls[i]; i++) {

        const { remove, value } = rolls[i];
        const num = Math.abs(value).toString();
        
        let op = (value > 0) ? '+' : '-';
        
        if (i === 0) {

            op = (value > 0) ? '' : '-';    
            str += (remove ? `${op}~~${num}~~` : (op + num));
        }
        else {
            
            str += ' ' + (remove ? `${op} ~~${num}~~` : (op + ' ' + num));
        }

        if (i > (maxDicePrint || 50)) {

            str += '...ET CETERA!'
            break;
        }
    }


    str += ')';

    for (const m of modifiers) {

        if (m === 0) { continue; }

        str += (m > 0)
            ? ' + ' + Math.abs(m)
            : ' - ' + Math.abs(m); 
    }

    let ret = `<@!${userId}> rolled \`${input}\`: ${str} = **${total}**` + (label ? ` for **\`${label}\`**` : '');
    
    const nl = (s: string) => { ret += '\n' + s; }

    if (disadvantage) {

        nl(' at **disadvantage**!');
    }
    else if (advantage) {

        nl(' with **advantage**!');
    }
    else {

        ret += '!';
    }

    if (crit) {

        nl('**CRIT!**')
    }
    else if (oof) {

        nl(':(');
    }

    return ret;
};