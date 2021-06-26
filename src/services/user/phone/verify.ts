import { middleware } from '@utils/format';
import { Service } from '@utils/Service';
import initSession from '../_initSession';

export default new Service<{
    code: string;
}>({
    route: '/user/phone/:param1/verify',
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    payload: {
        required: {
            code: 'string'
        }
    },
    middleware: [middleware.phone('param1')],
    async callback({ user, payload, param1, db, err, Op }) {

        await db.Code.verify(user.id, payload.code);

        const [phone] = user.phones.filter(p => p.number === param1);

        if (!phone) {

            err('phone_verify-01', 400, 'Invalid phone number.');
        }

        await phone.update({
            verifiedAt: Date.now()
        });

        await user.removeRole('unverified');

        return await initSession({ db }, user, this);
    }
});