import { Service } from '@utils/Service';

export default new Service<{}, {
    email: string;
    phone: string;
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
            phone: 'phone',
            email: 'string',
            username: 'string',
            name: 'string',
            firstName: 'string',
            lastName: 'string',
        }
    },
    callback: async ({ user, payload, err }) => {

        if (payload.email) {

            const [email] = await user.getEmails({
                where: {
                    address: payload.email
                }
            });

            if (!email || !email.verifiedAt) {

                err('user_set_profile-01', 400, 'Invalid email address.');
            }
        }

        if (payload.phone) {

            const [phone] = await user.getPhones({
                where: {
                    number: payload.phone
                }
            });

            if (!phone || !phone.verifiedAt) {

                err('user_set_profile-02', 400, 'Invalid phone number');
            }
        }

        await user.update(payload);

        return {
            ...user.getProfile(),
            ...payload
        }
    }
});