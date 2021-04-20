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
    callback: async (data) => {

        const db = data.db;
        const key = data.payload.email ? 'email' : 'username';
        const identifier = data.payload.email || data.payload.username;

        const user = await db.User.findOne({
            where: {
                [key]: identifier
            }
        });

        if (!user) {

            throw {
                code: '112-01',
                status: 400,
                message: 'Invalid login.'
            };
        }
        else if (!user.emailValidatedAt) {

            throw {
                code: '112-02',
                status: 403,
                message: 'Email address not yet verified, please check your inbox.'
            };
        }

        const match = bcrypt.compareSync(data.payload.password, user.password);

        if (!match) {

            throw {
                code: '113-01',
                status: 400,
                message: 'Invalid login.'
            };
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