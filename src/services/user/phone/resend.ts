import { Service } from '@utils/Service';
import sendSms from '@utils/sendSms';

export default new Service<{
    phone: string;
}>({
    route: '/user/phone/resend',
    payload: {
        required: {
            phone: 'string'
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

        const user = await db.User.lookup({ phoneNumber: data.payload.phone });

        if (user) {
        
            await db.Code.destroy({
                where: {
                    userId: user.id,
                    type: 'phone-verification'
                },
            });
    
            const code = await db.Code.createVerificationCode(user.id);

            await sendSms({
                twilio: data.ext.twilio,
                user,
                template: 'verification',
                params: {
                    'code': code.data
                }
            });
        }
    }
});;