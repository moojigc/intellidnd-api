import { Service } from '@utils/Service';
import list from './_list';

export default new Service({
    route: '/characters/:param1',
    method: 'get',
    isPublic: false,
    payload: {},
    callback: async (data) => {

        const [r] = await list(data);

        if (!r) {

            throw data.err('character_get', 404);
        }

        return r;
    }
});