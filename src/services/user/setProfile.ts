import { Service } from '@utils/Service';

export default new Service<{}, {
    email: string;
    username: string;
    name: string;
    firstName: string;
    lastName: string;
}>({
    route: '/user/profile',
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
});