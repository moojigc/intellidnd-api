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
    callback: async ({ user, ext, payload, db, sql, err }) => {

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
                    type: 'phone-verification'
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

            throw err('set_phone-01', 500, e.message, e);
        }

        await transaction.commit();

        return;
    }
});