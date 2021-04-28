import type { User } from '@models/User';
import type { Service } from '@types';
import sendEmail from '@utils/sendEmail';

export default {
    route: '/user/recover',
    method: 'post',
    isPublic: true,
    payload: {
        required: null,
        optional: {
            remember: 'boolean',
            username: 'string',
            email: 'email'
        },
        allowEmpty: false
    },
    callback: async ({
        db,
        payload,
        SError,
        headers
    }: Service.ServiceData<{
        username?: string;
        email?: string;
    }>) => {

        const key = 'email' in payload
            ? 'email'
            : 'username';

        const user = await db.User.lookup({ [key]: payload[key] });

        if (!user) {

            return;
        }

        await db.Token.destroy({
            where: {
                userId: user.id
            }
        });

        const token = await db.Token.create({
            roles: ['unverified'],
            userId: user.id,
            expires: 'verification',
        });

        await sendEmail({
            to: user.email,
            body: `Recover your account at {host}/reset?token=${token.jwt}`,
            host: headers.host
        });

        return;
    }
} as Service.Params;