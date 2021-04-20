import type { Model } from 'sequelize/types';
import type { Service } from '../../types';

export default {
    route: '/profile',
    method: 'get',
    isPublic: false,
    payload: {
        required: {},
        optional: {}
    },
    callback: async (data) => {

        const db = data.db;
        const user = await db.User.findByPk(data.userId, {
            include: {
                model: db.UserRole as typeof Model,
                as: 'roles'
            }
        });

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles.map(r => r.roleKey),
            createdAt: user.createdAt,
            modifiedAt: user.modifiedAt,
            lastLoginAt: user.lastLoginAt
        };
    }
} as Service.Params;