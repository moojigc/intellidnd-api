import user from './user';
import character from './character';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

const reducer = combineReducers({ user, character });

const middleware = (() => {
	switch (process.env.NODE_ENV) {
		case 'development':
			return composeWithDevTools(applyMiddleware(thunk, createLogger()));
		default:
			return applyMiddleware(thunk);
	}
})();

const store = createStore(reducer, middleware);

export default store;
export * from './user';
export * from './character';
