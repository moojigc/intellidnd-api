import { Service } from '@utils/Service';
import sendSms from '@utils/sendSms';

export default new Service({
    route: '/user/phone/:param1/send',
    payload: {},
    method: 'post',
    isPublic: false,
    rateLimit: {
        max: 3,
        window: 60 * 60 * 24
    },
    async callback(data) {

        const { db, user } = data;

        if (!user.phones.filter(p => p.number === data.param1).length) {

            data.err('phone_resend-01', 404, 'Phone number not found.');
        }

        const code = await db.Code.createVerificationCode(user.id, {
            parentEntity: 'phone',
            parentId: data.param1
        });

        await sendSms({
            twilio: data.ext.twilio,
            to: data.param1,
            template: 'verification',
            params: {
                'code': code.data
            }
        });
    }
});;