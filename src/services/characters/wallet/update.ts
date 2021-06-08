import { CharacterAttributes } from '../../../models/Character';
import { Service } from '@utils/Service';
import { ItemCreationAttributes, ItemAttributes } from '@models/Item';

export default new Service<{}, {
    gold: number;
    copper: number;
    electrum: number;
    silver: number;
    platinum: number;
}>({
    route: '/characters/:param1/wallet',
    method: 'patch',
    isPublic: false,
    payload: {
        optional: {
            platinum: 'integer',
            copper: 'integer',
            gold: 'integer',
            electrum: 'integer',
            silver: 'integer'
        }
    },
    callback: async ({
        db,
        user,
        payload,
        param1,
    }) => {

        const character = (await db.Character.lookup({
            id: param1,
            userId: user.id
        }))!;

        const wallet = await character.inventory.wallet.update(payload);

        return wallet;
    }
});