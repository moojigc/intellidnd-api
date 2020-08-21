import request from '../utils/request';

const defaultState: { default: CharacterDetails; all?: CharacterDetails[] } = {
	default: {
		stats: {
			initiative: 0,
			hp: 0,
			strength: 0,
			dexterity: 0,
			constitution: 0,
			intelligence: 0,
			wisdom: 0,
			charisma: 0,
		},
		inventory: {
			potions: [],
			weapons: [],
			misc: [],
			gold: 0,
			silver: 0,
			copper: 0,
			platinum: 0,
			electrum: 0,
		},
		webUserId: '',
		notificationsToDM: false,
		changelog: [{}],
	},
	all: [],
};

interface Item {
	name: string;
	value?: number;
	quantity: number;
}

type CharacterDispatchActions = {
	type:
		| 'GOT_STATS'
		| 'GOT_INVENTORY'
		| 'GOT_DEFAULT'
		| 'GOT_ALL_CHARACTERS'
		| 'GOT_CHARACTERS';
};
interface CharacterDetails {
	webUserId: string;
	stats: {
		initiative: number;
		hp: number;
		strength: number;
		dexterity: number;
		constitution: number;
		intelligence: number;
		wisdom: number;
		charisma: number;
	};
	notificationsToDM: boolean;
	inventory: {
		potions: Item[];
		weapons: Item[];
		misc: Item[];
		gold: number;
		silver: number;
		copper: number;
		platinum: number;
		electrum: number;
	};
	changelog: [
		{
			on?: Date;
			command?: string;
		}
	];
}

export type Character = {
	default?: CharacterDetails;
	all?: CharacterDetails[];
} & CharacterDispatchActions;

type Dispatch = (arg: CharacterDispatchActions) => {};

const characterAction = (action: Character) => action;

export const getAllCharacters = () => async (dispatch: Dispatch) => {
	let res = await request({ url: 'characters?q=all', method: 'GET' });
	dispatch(
		characterAction({ all: res.characters, type: 'GOT_ALL_CHARACTERS' })
	);
	return res.characters;
};

export const getDefaultCharacter = () => async (dispatch: Dispatch) => {
	let res = await request({ url: 'characters?q=default', method: 'GET' });
	dispatch(characterAction({ default: res.character, type: 'GOT_DEFAULT' }));
	return res.character;
};

export const getCharacters = () => async (dispatch: Dispatch) => {
	let res = await request({ url: 'characters', method: 'GET' });
	console.log(res.characters);
	dispatch(characterAction({ ...res.characters, type: 'GOT_CHARACTERS' }));
	return res.characters;
};

export default function (
	state = defaultState,
	action: { default: Character; all: Character[] } & CharacterDispatchActions
) {
	const character = { ...action };
	delete character.type;
	switch (action.type) {
		case 'GOT_ALL_CHARACTERS':
			return {
				...state,
				all: character.all,
			};
		case 'GOT_DEFAULT':
			return {
				...state,
				default: character.default,
			};
		case 'GOT_CHARACTERS':
			return {
				...state,
				...character,
			};
		default:
			return state;
	}
}
