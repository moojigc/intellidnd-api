import { CharacterCreationAttributes } from '../../models/Character';
import { Service } from '../../types';
import list from './_list';

export default {
    route: '/characters',
    method: 'get',
    isPublic: false,
    payload: {
        required: null,
        optional: {
            name: 'string'
        }
    },
    callback: list
} as Service.Params;