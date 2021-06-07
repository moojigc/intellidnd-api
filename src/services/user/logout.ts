import Service from "@utils/Service";

export default new Service({
    route: '/user/logout',
    method: 'post',
    isPublic: false,
    payload: {},
    async callback({ db, cookies }) {

        if (cookies.refresh) {

            const decoded = await db.Token.verifyRefresh(cookies.refresh);

            if (decoded) {

                await decoded.session.destroy();
            }
        }
    }
})