import { RequestWithUser, flash, serverError } from '../../middleware';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Player, User } from '../../models';
import { hashSync } from 'bcryptjs';

const logout = async (req: RequestWithUser, res: Response) => {
    req.logOut();
    res.json({
        message: `You are now logged out.`,
        redirect: '/login'
    }).end();
};

export default {
	isAuth: true,
	route: '/logout',
	callback: logout,
	method: 'get',
};
