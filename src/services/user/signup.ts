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
    rateLimit: {
        max: 10,
        skipFailed: true,
        skipSuccessful: false,
        window: 60 * 60
    },
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

        const [existing, email, phone] = [
            await db.User.findOne({
                where: {
                    [data.Op.or]: {
                        emailAddress: data.payload.email,
                        username: data.payload.username || '',
                        phoneNumber: data.payload.phone
                    }
                }
            }),
            await db.Email.findOne({
                where: {
                    address: data.payload.email
                }
            }),
            await db.Phone.findOne({
                where: {
                    number: data.payload.phone
                }
            })
        ];

        if (existing || email || phone) {

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