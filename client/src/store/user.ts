import request from '../utils/request';
import storage from '../utils/storage';
import moment from 'moment';

const defaultState = {
	auth: false,
};

type UserDispatchActions = {
	type:
		| 'LOGGED_IN'
		| 'GOT_STATUS'
		| 'LOGGED_OUT'
		| 'SET_DEFAULT_CHARACTER'
		| 'SIGNED_UP'
		| 'EMAIL_VALIDATED';
};
type UserDetails = {
	username?: string;
	email?: string;
	password?: string;
	auth: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	characterToken?: string;
	defaultPlayer?: string;
};

export type User = UserDispatchActions & UserDetails;

type Dispatch = (arg: User) => {};

export const userAction = (action: User) => action;

export const getStatus = () => async (dispatch: Dispatch) => {
	const user = await (async () => {
		let storedUser = storage({ key: 'user' });
		if (
			storedUser &&
			!moment(storedUser.expiration).isSameOrAfter(new Date())
		) {
			return storedUser;
		} else {
			let res = await request({ url: 'user/status', method: 'GET' });
			storage({ key: 'user', data: res.user });
			return res.user;
		}
	})();
	dispatch(userAction({ ...user, type: 'GOT_STATUS' }));
	return user;
};
export const login = (details: User) => async (dispatch: Dispatch) => {
	let res = await request({
		data: details,
		method: 'POST',
		url: details.characterToken
			? `user/login?token=${details.characterToken}`
			: 'user/login',
	});
	console.table(res);
	storage({ key: 'user', data: res.user });
	dispatch(userAction({ ...res.user, type: 'LOGGED_IN' }));
	return res;
};

export const logout = () => async (dispatch: Dispatch) => {
	let res = await request({
		method: 'GET',
		url: 'user/logout',
	});
	storage({ key: 'user', data: res.user });
	dispatch(userAction({ ...res.user, type: 'LOGGED_OUT' }));
	return res;
};

export const updateUserDefaultCharacter = (id) => (dispatch: Dispatch) => {
	dispatch(
		userAction({
			defaultPlayer: id,
			type: 'SET_DEFAULT_CHARACTER',
			auth: true,
		})
	);
};

export default function (state: UserDetails = defaultState, action: User) {
	const user = { ...action };

	switch (action.type) {
		case 'LOGGED_OUT':
			return {
				...state,
				...user,
			};
		case 'LOGGED_IN':
			return {
				...state,
				...user,
			};
		case 'GOT_STATUS':
			return {
				...state,
				...user,
			};
		case 'SET_DEFAULT_CHARACTER':
			return {
				...state,
				...user,
			};
		default:
			return state;
	}
}
