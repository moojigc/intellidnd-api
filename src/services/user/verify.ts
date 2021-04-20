import { Service } from '../../types';

export default {
    route: '/verify',
    payload: {
        required: {},
        optional: {},
    },
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    callback: async ({ db, userId }) => {

        const user = await db.User.findByPk(userId);

        if (!user) {

            throw {
                code: '111-01',
                status: 404
            };
        }
        else if (user.emailValidatedAt) {

            throw {
                code: '111-02',
                status: 400,
                message: 'already verified'
            };
        }

        await user.update({
            emailValidatedAt: Date.now(),
        });

        return { ok: true };
    }
} as Service.Params;