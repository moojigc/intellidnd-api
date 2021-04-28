import { Service } from "../../../types";

export default {
    route: '/user/phone/verify/:param1',
    method: 'patch',
    status: 204,
    isPublic: false,
    payload: {
        required: {},
        optional: {}
    },
    callback: async ({ user, param1, db }: Service.ServiceData<{
        code: string;
    }>) => {

        await db.Code.verify(user.id, param1);

        await user.update({
            phoneVerifiedAt: Date.now()
        });

        return;
    }
} as Service.Params;