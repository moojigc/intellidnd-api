import { CharacterCreationAttributes } from '../../models/Character';
import { Service } from '@utils/Service';

export default new Service<{
    name: string;
}, {
    guildId: string;
    race: string;
    class: string;
    background: string;
    experience: number;
    maxHp: number;
    hp: number;
    level: number;
    armorClass: number;
    initiative: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}>({
    route: '/character',
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
    async callback({
        db,
        user,
        payload,
        err
    }) {

        const existingName = await db.Character.count({
            where: {
                userId: user.id,
                name: payload.name
            }
        });

        if (existingName) {

            throw err('character_create-01', 400, 'Character named ' + payload.name + ' already belongs to this user');
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
});