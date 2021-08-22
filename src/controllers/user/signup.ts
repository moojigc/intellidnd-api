import { Service } from '@utils/Service';
import bcrypt from 'bcryptjs';
import sendVerificationEmail from './_sendVerificationEmail';
import addPhone from './phone/add';
import initSession from './_initSession';
import { middleware } from '@utils/format';

export default new Service<{
    password: string;
    verify: string;
    username: string;
}, {
    phone: string;
    email: string;
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
            username: 'string',
            password: 'string',
            verify: 'string'
        },
        optional: {
            phone: 'phone',
            email: 'email',
            firstName: 'string',
            lastName: 'string'
        }
    },
    middleware: [middleware.phone('phone')],
    async callback(data) {

        const db = data.db;

        if (data.payload.password !== data.payload.verify) {

            throw data.err('signup-01', 400, 'Passwords must match');
        }

        const existingItems = [
            await db.User.findOne({
                where: {
                    username: data.payload.username
                }
            }),
            await db.Email.findUnknown({
                address: data.payload.email
            }),
            await db.Phone.findUnknown({
                number: data.payload.phone
            })
        ] as const;

        if (existingItems.filter(n => !!n).length) {

            const existing = ['username', 'address', 'number']
                .filter(
                    p => existingItems.filter(i => i && p in i).length
                )
                .map(p => ({
                    username: 'username',
                    address: 'email',
                    number: 'phone'
                })[p]);

            throw data.err('signup-02', 403, existing.join(','));
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

            await user.update({ emailAddress: data.payload.email });
        }

        await user.createRole({
            userId: user.id,
            roleKey: 'unverified'
        }, { transaction });

        await transaction.commit();

        if (user.emailAddress) {

            await sendVerificationEmail(data, user, user.emailAddress);
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
        
        await user.populate();
        return await initSession(data, user, this);
    }
});