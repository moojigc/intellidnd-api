import { Service } from '@utils/Service';
import sendVerificationEmail from '../_sendVerificationEmail';

export default new Service({
    route: '/user/email/:param1/send',
    payload: {},
    method: 'post',
    isPublic: false,
    rateLimit: {
        max: 3,
        window: 60 * 60 * 24
    },
    async callback(data) {

        const { db, user } = data;

        const [email] = user.emails.filter(e => e.address === data.param1);

        if (!email) {

            data.err('email_resend-01', 403, 'Email not found.');
        }
        else if (email.verifiedAt) {

            data.err('email_resend-02', 403, 'Email is already verified.');
        }

        await sendVerificationEmail(data, user, data.param1);
    }
});;