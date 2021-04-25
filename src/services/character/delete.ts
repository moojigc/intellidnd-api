import { CharacterCreationAttributes } from '../../models/Character';
import { Service } from '../../types';

export default {
    route: '/character/:param1',
    method: 'delete',
    isPublic: false,
    status: 204,
    payload: {
        required: null,
        optional: null
    },
    callback: async ({
        db,
        user,
        param1,
        SError
    }) => {

        const r = await db.Character.destroy({
            where: {
                id: param1,
                userId: user.id
            }
        });

        if (r === 0) {

            throw new SError('character_delete-01', 404);
        }

        return;
    }
} as Service.Params;