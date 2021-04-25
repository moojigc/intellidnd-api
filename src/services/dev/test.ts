import { Service } from "../../types";

export default {
    route: '/test',
    method: 'all',
    status: 200,
    isPublic: true,
    payload: {
        required: {},
        optional: null,
    },
    callback: async ({ payload }: Service.ServiceData<{
        phone: string;
    }>) => {

        return {
            time: new Date().toLocaleString(),
            ...payload
        };
    }
} as Service.Params;