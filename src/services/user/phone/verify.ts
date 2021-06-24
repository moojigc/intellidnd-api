import { Service } from '@utils/Service';

export default new Service<{
    phone: string;
}>({
    route: '/user/phone/verify',
    method: 'patch',
    isPublic: false,
    payload: {
        required: {
            phone: 'phone'
        }
    },
    callback: async ({ user, payload, param1, db, err, Op }) => {

        await db.Code.verify(user.id, param1);

        const phone = await user.getPhone({
            where: {
                number: payload.phone
            }
        });

        if (!phone) {

            err('phone_verify-01', 400, 'Invalid phone number.');
        }

        await phone.update({
            verifiedAt: Date.now()
        });

        await user.update({
            phone: payload.phone
        });

        await db.Phone.destroy({
            where: {
                number: {
                    [Op.not]: user.phoneNumber
                },
                userId: user.id
            }
        });

        return;
    }
});