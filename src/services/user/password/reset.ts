import bcrypt from 'bcryptjs';
import Service from "@utils/Service";

export default new Service<{
    password: string;
}>({
    route: '/user/password/reset',
    method: 'patch',
    roles: ['recovery'],
    isPublic: false,
    payload: {
        required: {
            password: 'string'
        }
    },
    async callback({ user, payload, db }) {

        await user.update({
            password: bcrypt.hashSync(payload.password),
            lastPasswordChangeAt: Date.now()
        });

        await db.UserRole.destroy({
            where: {
                userId: user.id,
                roleKey: 'recovery'
            }
        });

        const session = await db.Token.generate({
            userId: user.id,
            roles: user.roles.map(r => r.roleKey),
            expires: 'session'
        });

        this.setInHeader = {
            cookie: {
                maxAge: session.sessionExpiresAt,
                value: session.refreshToken
            }
        };

        return {
            token: session.authToken,
            expiresAt: session.expiresAt
        };
    }
})