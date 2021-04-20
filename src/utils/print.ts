export const reset = '\x1b[0m';
export const actions = {
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	underscore: '\x1b[4m',
    blink: '\x1b[5m',
};
export const colors = {
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
};
export const backgrounds = {
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m'
};

/** 
 * Output to `stdout` with nice colors 
 */
const print = (
    input: any,
    color: keyof typeof colors = 'white',
    bg?: keyof typeof backgrounds | 'none',
    action?: keyof typeof actions | Array<'dashed' | 'big'>
) => {

    if (typeof input !== 'string') { input = JSON.stringify(input, null, 2); }

    bg ||= (color === 'white') ? 'bgBlack' : 'bgWhite';

    if (Array.isArray(action)) {

        if (action.includes('big')) {

            input = input.toUpperCase();
        }
        if (action.includes('dashed')) {

            input = `----${input}----`;
        }

        console.log(colors[color] + backgrounds[bg] + input + reset);
    }
    else if (action) {

        console.log(colors[color] + backgrounds[bg] + actions[action] + input + reset);
    }
    else if (bg === 'none') {

        console.log(colors[color] + input + reset);
    }
    else {

        console.log(colors[color] + backgrounds[bg] + input + reset);
    }
}

export default print;