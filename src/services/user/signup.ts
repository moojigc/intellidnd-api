import { Service } from '../../types';
import sendEmail from '../../utils/sendEmail';

export default {
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
    callback: async (data: Service.ServiceData<{
        email: string;
        password: string;
        verify: string;
        username?: string;
        firstName?: string;
        lastName?: string;
    }>) => {

        const db = data.db;

        if (data.payload.password !== data.payload.verify) {

            throw new data.SError('signup-01', 400, 'Passwords must match');
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
            throw new data.SError('signup-02', 403);
        }

        const transaction = await data.sql.transaction();

        const user = await db.User.create({
            username: data.payload.username,
            password: data.payload.password,
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
            body: `Verify email address at {host}/signup/verify?token=${token.jwt}`,
            to: user.email
        });

        return {
            name: user.name,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }
} as Service.Params;