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
};

type User = UserDispatchActions & UserDetails;

type Dispatch = (arg: User) => {};

const userAction = (action: User) => action;

export const logout = () => {};

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
		url: 'user/login',
	});
	storage({ key: 'user', data: res.user });
	dispatch(userAction({ ...res.user, type: 'LOGGED_IN' }));
	return res;
};

export default function (state: UserDetails = defaultState, action: User) {
	const user = { ...action };
	delete user.type;
	switch (action.type) {
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
		default:
			return state;
	}
}
