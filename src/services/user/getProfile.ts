import { Service } from '@utils/Service';

export default new Service({
    route: '/user/profile',
    method: 'get',
    isPublic: false,
    payload: {
        required: {},
        optional: {}
    },
    callback: async ({ user }) => {

        return user.getProfile();
    }
});