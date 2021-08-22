import { middleware } from '@utils/format';
import sendSms from '@utils/sendSms';
import Service from '@utils/Service';

export default new Service<{
    phone: string;
}>({
    route: '/user/phone',
    method: 'post',
    isPublic: false,
    rateLimit: {
        skipFailed: true
    },
    payload: {
        required: {
            phone: 'string'
        },
    },
    middleware: [middleware.phone('phone')],
    callback: async ({ user, ext, payload, db, sql, err }) => {

        const phones = user.phones || await user.getPhones();
        
        if (phones.filter(p => p.number === payload.phone).length) {
            return;
        }

        const transaction = await sql.transaction();
        
        try {

            const phone = await db.Phone.create({
                userId: user.id,
                number: payload.phone,
            }, {
                transaction
            });

            await user.populate();
            if (!user.phone) {

                await user.update({
                    phoneNumber: phone.number
                }, { transaction });
            }
    
            const code = await db.Code.createVerificationCode(user.id, {
                transaction,
                parentEntity: 'phone',
                parentId: phone.number
            });
    
            await sendSms({
                twilio: ext.twilio,
                to: phone.number,
                template: 'verification',
                params: {
                    code: code.data
                }
            });
        }
        catch (e) {

            await transaction.rollback();

            throw err('set_phone-01', 500, e.message, e);
        }

        await transaction.commit();

        return;
    }
});