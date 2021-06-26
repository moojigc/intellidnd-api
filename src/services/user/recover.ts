import { Service } from '@utils/Service';
import sendEmail from '@utils/sendEmail';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        headers
    }) {
        let [user, phone, email] = [
			await db.User.lookup(payload),
			await db.Phone.findByPk(payload.identifier),
			await db.Email.findByPk(payload.identifier),
		];

        if (!user || !phone || !email) {
            console.log('nope')
            await sleep(Math.floor(Math.random() * 1000));
            return;
        }
        else if (!phone || !email) {

            phone = user.phone;
            email = user.email;
        }
        else if (!user) {

            if (phone) {
                user = await phone.getUser();
            }
            else {
                user = await email.getUser();
            }
        }

        const role = await db.UserRole.create({
            userId: user.id,
            roleKey: 'recovery',
        });

        // await db.Token.destroy({
        //     where: {
        //         userId: user.id
        //     }
        // });

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