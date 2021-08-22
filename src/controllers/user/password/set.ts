import bcrypt from 'bcryptjs';
import Service from "@utils/Service";

export default new Service<{
    password: string;
    verify: string;
    original: string;
}>({
    route: '/user/password',
    method: 'patch',
    isPublic: false,
    payload: {
        required: {
            password: 'string',
            verify: 'string',
            original: 'string'
        }
    },
    async callback({ user, payload, db, err }) {

        const match = bcrypt.compareSync(payload.original, user.password!);

        if (!match) {

            throw err('password_set-01', 401);
        }

        if (payload.password !== payload.verify) {

            throw err('password_set-02', 400, 'New passwords must match!');
        }

        await user.update({
            password: bcrypt.hashSync(payload.password),
            lastPasswordChangeAt: Date.now()
        });
    }
})