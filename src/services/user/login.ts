import { Service } from "../../types";
import bcrypt from 'bcryptjs';

export default {
    route: '/login',
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
    callback: async (data: Service.ServiceData<{
        password: string;
        username?: string;
        email?: string;
        remember?: boolean;
    }>) => {

        const db = data.db;
        const key = data.payload.email ? 'email' : 'username';
        const identifier = data.payload.email || data.payload.username;

        const user = await db.User.lookup({
            [key]: identifier
        });

        const match = bcrypt.compareSync(data.payload.password, user.password
            || (data.payload.password + Date.now()).split('').reverse().join(''));

        if (!user || !match) {

            new data.SError('login-01', 401);
        }
        else if (!user.emailValidatedAt) {

            new data.SError('login-02', 403);
        }

        const now = Date.now();
        await user.update({
            lastLoginAt: now
        });

        const expiresAt = data.payload.remember ? null : 1000 * 60 * 60 * 24;
        const token = await db.Token.create({
            expires: now + expiresAt,
            userId: user.id,
            roles: (await user.getRoles()).map(r => r.roleKey),
        });
        
        return { token: token.jwt, expiresAt, name: user.name, email: user.email };
    }
} as Service.Params;