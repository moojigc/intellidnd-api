import { Service } from '@utils/Service';

export default new Service({
    route: '/user/verify',
    payload: {},
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    async callback({ user, db }) {

        if (!user.emailValidatedAt) {

            await user.update({
                emailValidatedAt: Date.now()
            });
        }

        const token = await db.Token.generate({
            userId: user.id,
            expires: 'session',
            roles: (await user.getRoles()).map(r => r.roleKey)
        });

        this.setInHeader = {
            cookie: token.refreshToken
        };

        return {
            token: token.refreshToken,
            expiresAt: token.expiresAt
        };
    }
});;