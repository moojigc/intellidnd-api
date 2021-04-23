import type { Model } from 'sequelize/types';
import type { Service } from '../../types';

export default {
    route: '/profile',
    method: 'get',
    isPublic: false,
    payload: {
        required: {},
        optional: {}
    },
    callback: async ({ user }) => {

        return user.getProfile();
    }
} as Service.Params;