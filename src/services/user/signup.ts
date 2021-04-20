import { ValidationError } from 'sequelize';
import { Service } from '../../types';
import sendEmail from '../../utils/sendEmail';

export default {
    route: '/signup',
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

            throw {
                code: '107-01',
                status: 400,
                message: 'Passwords must match'
            };
        }

        const transaction = await data.sql.transaction();

        const user = await db.User.create({
            username: data.payload.username || null,
            password: data.payload.password,
            email: data.payload.email,
            firstName: data.payload.firstName,
            lastName: data.payload.lastName
        }, { transaction });

        const token = await db.Token.create({
            expires: 1000 * 60 * 60 * 24,
            userId: user.id,
            roles: ['unverified']
        }, { transaction });

        try {

            await sendEmail({
                body: `Verify email address at https://moojigbc.com/verify?token=${token.jwt}`,
                to: user.email
            });
        }
        catch (e) {

            await transaction.rollback();

            console.error(e);

            throw {
                code: '107-02',
                status: 500,
                message: 'error sending email'
            };
        }

        await transaction.commit();

        return {
            name: user.name,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }
} as Service.Params;