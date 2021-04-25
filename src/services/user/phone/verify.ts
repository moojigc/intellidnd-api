import { Service } from "../../../types";

export default {
    route: '/user/phone/verify/:param1',
    param1: {
        'code': 'string'
    },
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

        user.set('phoneVerifiedAt', Date.now());
        await user.save();

        return;
    }
} as Service.Params;