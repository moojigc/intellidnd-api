import { Service } from '../../types';

let status = 200;

export default {
    route: '/ping',
    method: 'all',
    status: status,
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