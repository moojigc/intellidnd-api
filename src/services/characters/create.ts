import { CharacterCreationAttributes } from '../../models/Character';
import { Service } from '../../types/index';

export default {
    route: '/characters',
    method: 'post',
    isPublic: false,
    payload: {
        required: {
            name: 'string',
        },
        optional: {
            guildId: 'string',
            race: 'string',
            class: 'string',
            background: 'string',
            experience: 'integer',
            maxHp: 'integer',
            hp: 'integer',
            level: 'integer',
            armorClass: 'integer',
            initiative: 'integer',
            strength: 'integer',
            dexterity: 'integer',
            constitution: 'integer',
            intelligence: 'integer',
            wisdom: 'integer',
            charisma: 'integer',
        }
    },
    rateLimit: {
        skipFailed: true
    },
    callback: async ({
        db,
        user,
        payload,
        SError
    }: Service.ServiceData<CharacterCreationAttributes>) => {

        const existingName = await db.Character.count({
            where: {
                userId: user.id,
                name: payload.name
            }
        });

        if (existingName) {

            throw new SError('character_create-01', 400, 'Character named ' + payload.name + ' already belongs to this user');
        }

        const char = await db.Character.create({
            // @ts-ignore
            userId: user.id,
            ...payload
        });

        const inv = await db.Inventory.create({
            characterId: char.id
        });

        const wallet = await db.Wallet.create({
            inventoryId: inv.id,
        });

        return {
            id: char.id,
            ...payload,
            inventory: {
                items: []
            },
            wallet: wallet.coins
        };
    }
} as Service.Params;