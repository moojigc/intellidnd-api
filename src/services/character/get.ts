import { Service } from '../../types';
import list from './_list';

export default {
    route: '/character/:param1',
    method: 'get',
    isPublic: false,
    payload: {
        required: null,
        optional: null
    },
    callback: async (data) => {

        const [r] = await list(data);

        if (!r) {

            throw new data.SError('character_get', 404);
        }

        return r;
    }
} as Service.Params;