type ErrorAction = {
	type: 'GOT_ERROR';
	errors: any;
};

const gotError = (actions: ErrorAction) => actions;

export const devError = (error) => {
	if (process.env.NODE_ENV === 'development') console.error(error)
}

export const logError = (error: any) => (dispatch) => {
	if (error) {
		dispatch(gotError({ type: 'GOT_ERROR', errors: error }));
		devError(error)
	}
};

export default function (state = { errors: {} }, action: ErrorAction) {
	switch (action.type) {
		case 'GOT_ERROR':
			return {
				...state,
				errors: action.errors,
			};
		default:
			return state;
	}
}
