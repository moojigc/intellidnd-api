import { Service } from '@utils/Service';

export default new Service({
    route: '/user/verify/email',
    payload: {},
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    async callback({ user, db }) {

        user.email = await user.getEmail();

        if (!user.email.verifiedAt) {

            await user.email.update({
                verifiedAt: Date.now()
            });
        }

        const token = await db.Token.generate({
            userId: user.id,
            expires: 'session',
            roles: (await user.getRoles()).map(r => r.roleKey)
        });

        this.setInHeader = {
            cookie: {
                maxAge: token.sessionExpiresAt,
                value: token.refreshToken
            }
        };

        return {
            token: token.authToken,
            expiresAt: token.expiresAt
        };
    }
});;