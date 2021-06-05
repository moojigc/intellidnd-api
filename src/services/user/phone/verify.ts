import { Service } from '@utils/Service';

export default new Service<{
    code: string;
}>({
    route: '/user/phone/verify/:param1',
    method: 'patch',
    isPublic: false,
    payload: {},
    callback: async ({ user, param1, db }) => {

        await db.Code.verify(user.id, param1);

        await user.update({
            phoneVerifiedAt: Date.now()
        });

        return;
    }
});