import Service from '@utils/Service';
import bcrypt from 'bcryptjs';

export default new Service<{
    password: string;
    identifier: string;
}>({
    route: '/user/login',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            password: 'string',
            identifier: 'string'
        },
    },
    // rateLimit: {
    //     max: 5,
    //     skipFailed: false,
    //     skipSuccessful: true,
    //     window: 1000 * 60 * 15
    // },
    async callback({ db, err, payload, Op }) {
        
        const where = /\d{10}/.test(payload.identifier)
            ? { phone: payload.identifier }
            : {
                [Op.or]: {
                    email: payload.identifier,
                    username: payload.identifier,
                }
            }

        const user = await db.User.lookup(where);

        const match = bcrypt.compareSync(
            payload.password, user?.password
            || (payload.password + Date.now()).split('').reverse().join('')
        );

        if (!user || !match) {

            throw err('login-01', 401);
        }
        else if (!user.emailValidatedAt) {

            throw err('login-02', 403);
        }

        const now = Date.now();
        await user.update({
            lastLoginAt: now
        });

        const token = await db.Token.generate({
            expires: 'session',
            userId: user.id,
            roles: (await user.getRoles()).map(r => r.roleKey),
        });

        this.setInHeader = {
            cookie: {
                value: token.refreshToken,
                maxAge: token.sessionExpiresAt
            }
        };
        
        return {
			token: token.authToken,
			expiresAt: token.expiresAt ? token.expiresAt : null,
			name: user.name,
			email: user.email,
		};
    },
})