import { Service } from '@utils/Service';

export default new Service({
    route: '/ping',
    method: 'all',
    isPublic: true,
    payload: {},
    async callback(data) {

        return {
            headers: data.headers,
            time: new Date().toLocaleString()
        };
    }
});