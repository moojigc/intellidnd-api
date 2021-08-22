import { Service } from '@utils/Service';

export default new Service({
    route: '/characters/:param1',
    method: 'delete',
    isPublic: false,
    payload: {},
    callback: async ({
        db,
        user,
        param1,
        err
    }) => {

        const r = await db.Character.destroy({
            where: {
                id: param1,
                userId: user.id
            }
        });

        if (r === 0) {

            throw err('character_delete-01', 404);
        }

        return;
    }
});