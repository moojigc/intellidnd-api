import bcrypt from 'bcryptjs';
import { Service } from '../../types';

export default {
    route: '/user/login',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            password: 'string'
        },
        optional: {
            remember: 'boolean',
            username: 'string',
            email: 'email'
        }
    },
    rateLimit: {
        skipSuccessful: true,
        skipFailed: false
    },
    callback: async (data: Service.ServiceData<{
        password: string;
        username?: string;
        email?: string;
        remember?: boolean;
    }>) => {

        const { db, SError } = data;
        const key = data.payload.email ? 'email' : 'username';
        const identifier = data.payload.email || data.payload.username;

        const user = await db.User.lookup({
            [key]: identifier
        });

        const match = bcrypt.compareSync(data.payload.password, user?.password
            || (data.payload.password + Date.now()).split('').reverse().join(''));

        if (!user || !match) {

            throw new SError('login-01', 401);
        }
        else if (!user.emailValidatedAt) {

            throw new SError('login-02', 403);
        }

        const now = Date.now();
        await user.update({
            lastLoginAt: now
        });

        const expiresAt = data.payload.remember ? 'sessionLong' : 'session';
        const token = await db.Token.generate({
            expires: expiresAt,
            userId: user.id,
            roles: (await user.getRoles()).map(r => r.roleKey),
        });
        
        return {
			token: token.jwt,
			expiresAt: expiresAt,
			name: user.name,
			email: user.email,
		};
    }
} as Service.Params;