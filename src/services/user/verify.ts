import { Service } from '../../types';

export default {
    route: '/verify',
    payload: {
        required: {},
        optional: {},
    },
    status: 204,
    method: 'patch',
    isPublic: false,
    callback: async ({ user, SError }) => {

        if (!user) {

            throw new SError('verify-01', 403);
        }
        else if (user.emailValidatedAt) {

            throw new SError('verify-02', 403, 'Already verified');
        }

        user.set('emailValidatedAt', Date.now());
        await user.save();

        return;
    }
} as Service.Params;