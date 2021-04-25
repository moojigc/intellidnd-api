import { Service } from "../../types";

export default {
    route: '/ping',
    method: 'all',
    status: 200,
    isPublic: true,
    payload: {
        required: {},
        optional: {
            status: 'number'
        }
    },
    callback: async (data) => {

        if (data.payload.status) {

            status = data.payload.status;
        }

        return {
            time: new Date().toLocaleString()
        };
    }
} as Service.Params;