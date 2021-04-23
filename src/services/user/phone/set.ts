import { Service } from '../../../types';

export default {
    route: '/user/phone',
    method: 'post',
    status: 204,
    isPublic: false,
    payload: {
        required: {
            phone: 'string'
        },
        optional: {}
    },
    callback: async ({ user, ext, payload, db, sql, SError }: Service.ServiceData<{
        phone: string;
    }>) => {

        payload.phone = payload.phone.split('').filter(r => /\d/.test(r)).join('').padStart(12, '+1');

        // if (user.phone === payload.phone) {

        //     return;
        // }

        const transaction = await sql.transaction();
        
        try {

            await user.update({ phone: payload.phone, phoneVerifiedAt: null }, { transaction });
    
            await db.Code.destroy({
                where: {
                    userId: user.id,
                    type: 'verification'
                },
                transaction
            });
    
            const code = await db.Code.createVerificationCode(user.id, transaction);
    
            await ext.twilio.messages.create({
                body: `Your IntelliDnD verification code is ${code.data}`,
                from: '+' + process.env.TWILIO_FROM,
                to: payload.phone
            });
        }
        catch (e) {

            await transaction.rollback();

            throw new SError('set_phone-01', 500, e.message, e);
        }

        await transaction.commit();

        return;
    }
} as Service.Params;