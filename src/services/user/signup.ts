import { Service } from '@utils/Service';
import sendEmail from '../../utils/sendEmail';
import bcrypt from 'bcryptjs';

export default new Service<{
    email: string;
    password: string;
    verify: string;
}, {
    username: string;
    firstName: string;
    lastName: string;
}>({
    route: '/user/signup',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            email: 'email',
            password: 'string',
            verify: 'string'
        },
        optional: {
            username: 'string',
            firstName: 'string',
            lastName: 'string'
        }
    },
    async callback(data) {

        const db = data.db;

        if (data.payload.password !== data.payload.verify) {

            throw data.err('signup-01', 400, 'Passwords must match');
        }

        const existing = await db.User.count({
            where: {
                [data.Op.or]: {
                    email: data.payload.email,
                    username: data.payload.username || ''
                }
            }
        });

        if (existing) {
            throw data.err('signup-02', 403);
        }

        const transaction = await data.sql.transaction();

        const user = await db.User.create({
            username: data.payload.username,
            password: bcrypt.hashSync(data.payload.password),
            email: data.payload.email,
            firstName: data.payload.firstName,
            lastName: data.payload.lastName
        }, { transaction });

        const token = await db.Token.generate({
            expires: 'verification',
            userId: user.id,
            roles: ['unverified']
        }, transaction);

        await transaction.commit();

        await sendEmail({
            body: `Verify email address at {host}/signup/verify?token=${token.refreshToken}`,
            to: user.email
        });

        this.setInHeader = {
            cookie: {
                maxAge: token.expiresAt,
                value: token.refreshToken
            }
        }

        return {
            name: user.name,
            username: user.username,
            token: token.authToken,
            expiresAt: token.expiresAt,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }
});