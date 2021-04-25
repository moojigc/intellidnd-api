import { CharacterAttributes } from '../../models/Character';
import { Service } from '../../types/index';

export default {
    route: '/character/:param1',
    method: 'patch',
    isPublic: false,
    payload: {
        required: null,
        optional: {
            name: 'string',
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
        param1,
        SError
    }: Service.ServiceData<Partial<CharacterAttributes>>) => {

        const character = await db.Character.findOne({
            where: {
                id: param1,
                userId: user.id
            }
        })
        
        if (!character) {

            throw new SError('character_update-01', 404);
        }

        await character.update(payload);

        return character.get();
    }
} as Service.Params;