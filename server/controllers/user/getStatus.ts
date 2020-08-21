import { User } from '../../models';
import { serverError } from '../../middleware';
import { Response, Request } from 'express';

const getStatus = async (req: Request, res: Response) => {
	try {
		if (req.user) {
			const user = await User.findById(req.user);
			res.json({
				user: {
					id: user._id,
					username: user.username,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					email: user.email,
					auth: true,
					expiration: req.session.cookie.expires
				}
			});
		} else {
			res.json({
				user: {
					id: null,
					username: 'Guest',
					auth: false,
				},
			});
		}
	} catch (error) {
		serverError(res, error);
	}
};

export default {
	route: '/status',
	isAuth: false,
	method: 'get',
	callback: getStatus,
};
