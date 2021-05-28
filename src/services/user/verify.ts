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

        const token = await db.Token.generate({
            userId: user.id,
            expires: 'session',
            roles: (await user.getRoles()).map(r => r.roleKey)
        });

        return {
            token: token.jwt
        };
    }
} as Service.Params;