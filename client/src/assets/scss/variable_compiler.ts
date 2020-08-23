'use strict';
import * as fs from 'fs';
import { resolve } from 'path';
const ARGS = process.argv.slice(2);

function convertVarsToScss(input = [__dirname, '..', '..', 'App.scss']) {
	const source = fs.readFileSync(resolve(...input), { encoding: 'utf8' });
	const cssVariablesRegex = /(?<=--)(.*?)(?=;)/g;
	let cssVars = source
		.split('\n')
		.map((s) => s.split(cssVariablesRegex))
		.reduce((pv, cv) => cv.concat(pv))
		.filter((s) => !/--|^$|;|{|}|\(|\)|&|SFMono-Regular/.test(s));
	return cssVars.map((s) => `$${s};`).join('\n');
}
function writeToScssFile(input: string) {
	fs.writeFileSync(__dirname + '/variables.scss', input);
}

writeToScssFile(convertVarsToScss(ARGS.length ? ARGS : undefined));
