import { CharacterCreationAttributes } from '../../models/Character';
import { Service } from '@utils/Service';
import list from './_list';

export default new Service<{}, {
    name: string;
}>({
    route: '/characters',
    method: 'get',
    isPublic: false,
    payload: {
        optional: {
            name: 'string'
        }
    },
    callback: list
});