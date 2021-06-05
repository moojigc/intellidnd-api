import { Service } from '@utils/Service';
import sendEmail from '@utils/sendEmail';

export default new Service<{
    identifier: string;
}>({
    route: '/user/recover',
    method: 'post',
    isPublic: true,
    payload: {
        optional: {
            identifier: 'string'
        },
    },
    async callback({
        db,
        payload,
        headers,
        Op
    }) {

        const where = /\d{10}/.test(payload.identifier)
            ? { phone: payload.identifier }
            : {
                [Op.or]: {
                    email: payload.identifier,
                    username: payload.identifier,
                }
            }
            
        const user = await db.User.lookup(where);

        if (!user) {

            return;
        }

        const role = await db.UserRole.create({
            userId: user.id,
            roleKey: 'recovery',
        });

        await db.Token.destroy({
            where: {
                userId: user.id
            }
        });

        const token = await db.Token.generate({
            roles: [role.roleKey],
            userId: user.id,
            expires: 'verification',
        });

        await sendEmail({
            to: user.email,
            body: `Recover your account at {host}/reset?token=${token.authToken}`,
            host: headers.host
        });

        this.setInHeader = {
            cookie: {
                maxAge: 1000 * 60 * 60,
                value: token.refreshToken
            }
        };

        return;
    }
});