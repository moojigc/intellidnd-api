import { Service } from "../../types";

export default {
    route: '/user/verify',
    payload: {
        required: null,
        optional: null,
    },
    status: 204,
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    callback: async ({ user, db }) => {

        if (!user.emailValidatedAt) {

            await user.update({
                emailValidatedAt: Date.now()
            });
        }

        const token = await db.Token.create({
            userId: user.id,
            expires: 'session'
        });

        return {
            token: token.jwt
        };
    }
} as Service.Params;