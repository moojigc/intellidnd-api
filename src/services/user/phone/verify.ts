import { Service } from '@utils/Service';

export default new Service<{
    phone: string;
}>({
    route: '/user/phone/:param1/verify',
    method: 'patch',
    isPublic: false,
    payload: {
        required: {
            phone: 'phone'
        }
    },
    callback: async ({ user, payload, param1, db, err, Op }) => {

        await db.Code.verify(user.id, param1);

        const [phone] = user.phones.filter(p => p.number === param1);

        if (!phone) {

            err('phone_verify-01', 400, 'Invalid phone number.');
        }

        await phone.update({
            verifiedAt: Date.now()
        });
    }
});