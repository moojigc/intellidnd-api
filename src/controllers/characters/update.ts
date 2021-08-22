import { CharacterAttributes } from '../../models/Character';
import { Service } from '@utils/Service';

export default new Service<{}, Omit<CharacterAttributes, 'userId' | 'createdAt' | 'modifiedAt' | 'id'>>({
    route: '/characters/:param1',
    method: 'patch',
    isPublic: false,
    payload: {
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
    callback: async ({
        db,
        user,
        payload,
        param1,
        err
    }) => {

        const character = await db.Character.findOne({
            where: {
                id: param1,
                userId: user.id
            }
        })
        
        if (!character) {

            throw err('character_update-01', 404);
        }

        await character.update(payload);

        return character.get();
    }
});