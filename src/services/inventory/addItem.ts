import { CharacterAttributes } from '../../models/Character';
import { Service } from '@utils/Service';
import { ItemCreationAttributes, ItemAttributes } from '@models/Item';

export default new Service<{
    name: string;
}, {
    type: ItemAttributes['type'];
    value: number;
}>({
    route: '/characters/:param1/inventory',
    method: 'post',
    isPublic: false,
    payload: {
        required: {
            name: 'string'
        },
        optional: {
            type: 'string',
            value: 'integer'
        }
    },
    callback: async ({
        db,
        user,
        payload,
        param1,
        err
    }) => {

        const character = (await db.Character.lookup({
            id: param1,
            userId: user.id
        }))!;

        const item = await db.Item.create({
            inventoryId: character.inventory.id,
            name: payload.name,
            type: payload.type || 'misc'
        });

        return item;
    }
});