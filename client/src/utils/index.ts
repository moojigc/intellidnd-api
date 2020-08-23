import { useMediaQuery } from '@material-ui/core';

export const capitalize = (input: string, ...exceptions: string[]) => {
	let words = input.split(' ');
	let keywords = ['of', 'a', 'the', 'an', 'to', ...exceptions];
	let match = (word: string) =>
		keywords.filter((keyword) => keyword === word).length > 0;
	const caps = words.map((w) => {
		if (!match(w))
			return w.slice()[0].toUpperCase() + w.substring(1).toLowerCase();
		else return w.toLowerCase();
	});
	return caps.join(' ');
};

export const useCheckMobile = () => useMediaQuery('(max-width: 900px)');
