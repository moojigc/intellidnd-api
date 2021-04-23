import type { Service } from '../../types';

export default {
    route: '/profile',
    method: 'patch',
    isPublic: false,
    payload: {
        required: {},
        optional: {
            email: 'string',
            username: 'string',
            name: 'string',
            firstName: 'string',
            lastName: 'string',
        }
    },
    callback: async ({ user, payload }) => {

        await user.update(payload);

        return {
            ...user.getProfile(),
            ...payload
        }
    }
} as Service.Params;