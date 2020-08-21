import { flash } from '../../middleware';
import { Response } from 'express';

const response = {
    redirect: "/",
    user: {
        username: 'Guest',
        auth: false
    }
}

const logout = async (req: RequestWithUser, res: Response) => {
    if (!req.isAuthenticated()) {
        res.json({
            ...flash('error', 'You were never logged in.'),
            ...response
        })
    } else {
        req.logOut();
        res.json({
            ...flash('success', 'You are now logged out.'),
            ...response
        }).end();
    }
};

export default {
	isAuth: true,
	route: '/logout',
	callback: logout,
	method: 'get',
};
