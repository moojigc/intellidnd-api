import { Service } from '@utils/Service';
import sendEmail from '@utils/sendEmail';

export default new Service<{
    identifier: string;
}>({
    route: '/user/recover',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            identifier: 'string'
        },
    },
    async callback({
        db,
        payload,
        headers,
        Op
    }) {
            
        const user = await db.User.lookup(payload);

        if (!user || !user.email) {

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

        if (user.emailAddress) {

            await sendEmail({
                to: user.emailAddress,
                body: `Recover your account at {host}/password/recover?token=${token.authToken}`,
                headers
            });
        }

        this.setInHeader = {
            cookie: {
                maxAge: 1000 * 60 * 60,
                value: token.refreshToken
            }
        };

        return;
    }
});