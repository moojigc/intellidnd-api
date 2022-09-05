import Service from '@utils/Service';

export default new Service<{
	refresh: string;
}>({
	route: '/user/session/refresh',
	method: 'post',
	isPublic: true,
	payload: {
		required: {
			refresh: 'string',
		},
	},
	roles: ['user', 'unverified'],
	// rateLimit: {
	//     max: 2,
	//     window: 1000 * 60 * 1,
	//     skipFailed: true
	// },
	async callback({ db, payload, err }) {
		if (!payload.refresh) {
			err('refresh-01', 401);
		}

		const decoded = await db.Token.verifyRefresh(payload.refresh);

		if (decoded === false) {
			throw err('refresh-02', 401);
		}

		const roles = await db.UserRole.findAll({
			where: {
				userId: decoded.userId,
			},
		});

		return db.Token.getAuthToken({
			userId: decoded.userId,
			roles: roles.map((r) => r.roleKey).join(','),
		});
	},
});
