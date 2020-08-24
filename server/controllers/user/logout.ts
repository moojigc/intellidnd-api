import { flash } from '../../middleware';
import { Response } from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';

const MongoDBStore = connectMongo(session),
	Store = new MongoDBStore({
		uri: process.env.MONGODB_URI,
		collection: 'user-sessions',
	});

const response = {
	redirect: '/',
	user: {
		id: null,
		username: 'Guest',
		auth: false,
	},
};

const logout = async (req: RequestWithUser, res: Response) => {
	if (!req.isAuthenticated()) {
		res.json({
			...flash('error', 'You were never logged in.'),
			...response,
		});
	} else {
		req.logOut();
		Store.destroy(req.session.id, (err) => err && console.error(err));
		res.json({
			...flash('success', 'You are now logged out.'),
			...response,
		}).end();
	}
};

export default {
	isAuth: true,
	route: '/logout',
	callback: logout,
	method: 'get',
};
