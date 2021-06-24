import { Service } from '@utils/Service';
import bcrypt from 'bcryptjs';
import sendVerificationEmail from './_sendVerificationEmail';
import addPhone from './phone/add';

export default new Service<{
    password: string;
    verify: string;
}, {
    phone: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}>({
    route: '/user/signup',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            password: 'string',
            verify: 'string'
        },
        optional: {
            phone: 'phone',
            email: 'email',
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

        const existing = await db.User.findOne({
            where: {
                [data.Op.or]: {
                    email: data.payload.email,
                    username: data.payload.username || '',
                    phoneNumber: data.payload.phone
                }
            }
        });

        if (existing && existing.email) {

            if (!existing.email.verifiedAt) {

                await sendVerificationEmail(data, existing);
            }

            throw data.err('signup-02', 403);
        }

        const transaction = await data.sql.transaction();

        const user = await db.User.create({
            username: data.payload.username,
            password: bcrypt.hashSync(data.payload.password),
            firstName: data.payload.firstName,
            lastName: data.payload.lastName
        });

        if (data.payload.email) {

            await db.Email.create({
                address: data.payload.email,
                userId: user.id
            });

            user.set({ emailAddress: data.payload.email });
        }

        if (data.payload.phone) {

            await addPhone.callback({
                ...data,
                user,
                payload: {
                    phone: data.payload.phone
                }
            });
        }

        await transaction.commit();

        if (user.emailAddress) {

            await sendVerificationEmail(data, user);
        }

        return {
            name: user.name,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }
});