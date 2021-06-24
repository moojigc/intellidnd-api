import Service from '@utils/Service';
import bcrypt from 'bcryptjs';
import logout from './logout';
import setPhone from './phone/add';

import sendVerificationEmail from './_sendVerificationEmail';

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
    rateLimit: {
        max: 5,
        skipFailed: false,
        skipSuccessful: true,
        window: 60 * 15
    },
    async callback(data) {

        await logout.callback(data);

        const { db, err, payload, Op, ext } = data;

        const user = await db.User.lookup({ identifier: payload.identifier });

        const match = bcrypt.compareSync(
            payload.password, user?.password
            || (payload.password + Date.now()).split('').reverse().join('')
        );

        if (user && !user.password) {

            throw err('login-02', 403, 'No password set.');
        }

        if (!user || !match) {

            throw err('login-01', 401);
        }

        const regex = new RegExp(payload.identifier);
        let key: 'phoneNumber' | 'emailAddress' | 'username';
        if (user.phoneNumber && regex.test(user.phoneNumber)) {
            key = 'phoneNumber';
        }
        else if (user.emailAddress && regex.test(user.emailAddress)) {
            key = 'emailAddress';
        }
        else {
            key = 'username';
        }

        if (user.phone && !user.phone.verifiedAt) {

            setPhone.callback({ ...data, payload: { phone: user.phoneNumber! } });
        }
        if (user.email && !user.email.verifiedAt) {
        
            await sendVerificationEmail(data, user, user.email.address);
        }
        if (!user.phone?.verifiedAt && !user.email?.verifiedAt) {

            throw err('login-04', 403, 'Please verify your account to proceed.');
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