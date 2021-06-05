import Service from "@utils/Service";

export default new Service({
    route: '/user/session/refresh',
    method: 'post',
    isPublic: true,
    payload: {},
    // rateLimit: {
    //     max: 2,
    //     window: 1000 * 60 * 1,
    //     skipFailed: true
    // },
    async callback({ db, cookies, err }) {

        if (!cookies.refresh) {

            err('refresh_01', 401);
        }

        const decoded = await db.Token.verifyRefresh(cookies.refresh);

        if (decoded === false) {

            throw err('refresh_02', 401);
        }

        const roles = await db.UserRole.findAll({
            where: {
                userId: decoded.userId
            }
        });

        return db.Token.getAuthToken({
            userId: decoded.userId,
            roles: roles.map(r => r.roleKey).join(',')
        });
    }
})