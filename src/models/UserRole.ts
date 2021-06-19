import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';
import type { Role, RoleId } from './Role';
import type { User, UserId } from './User';

export interface UserRoleAttributes {
    roleKey: string;
    userId: string;
    createdAt: number;
}

export type UserRoleId = UserRole['userId'] & UserRole['roleKey']
export type UserRoleCreationAttributes = Optional<
    UserRoleAttributes,
    'createdAt'
>;

export class UserRole
    extends Model<UserRoleAttributes, UserRoleCreationAttributes>
    implements UserRoleAttributes {
    roleKey!: string;
    userId!: string;
    createdAt!: number;

    // UserRole belongsTo Role via roleKey
    role!: Role;
    getRole!: Sequelize.BelongsToGetAssociationMixin<Role>;
    setRole!: Sequelize.BelongsToSetAssociationMixin<Role, RoleId>;
    createRole!: Sequelize.BelongsToCreateAssociationMixin<Role>;
    // UserRole belongsTo User via userId
    user!: User;
    getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof UserRole {
        UserRole.init(
            {
                roleKey: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    references: {
                        model: 'role',
                        key: 'key',
                    },
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    references: {
                        model: 'user',
                        key: 'id',
                    },
                    primaryKey: true
                },
                createdAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
                },
            },
            {
                sequelize,
                tableName: 'userRole',
                hasTrigger: true,
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'roleKey' }, { name: 'userId' }],
                    },
                    {
                        name: 'userId',
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return UserRole;
    }
}

export default UserRole;