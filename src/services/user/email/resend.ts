import { Service } from '@utils/Service';
import sendVerificationEmail from '../_sendVerificationEmail';

export default new Service<{
    email: string;
}>({
    route: '/user/email/resend',
    payload: {
        required: {
            email: 'email'
        }
    },
    method: 'post',
    isPublic: true,
    rateLimit: {
        max: 3,
        window: 60 * 60 * 24
    },
    async callback(data) {

        const { db } = data;

        const user = await db.User.lookup({ emailAddress: data.payload.email });

        if (user) {
        
            await sendVerificationEmail(data, user);
        }
    }
});;