import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';
import type { Role, RoleId } from './Role';
import type { User, UserId } from './User';

export interface UserRoleAttributes {
    id: string;
    roleKey: string;
    userId: string;
    createdAt: number;
}

export type UserRolePk = 'id';
export type UserRoleId = UserRole[UserRolePk];
export type UserRoleCreationAttributes = Optional<
    UserRoleAttributes,
    UserRolePk
>;

export class UserRole
    extends Model<UserRoleAttributes, UserRoleCreationAttributes>
    implements UserRoleAttributes {
    id!: string;
    roleKey!: string;
    userId!: string;
    createdAt!: number;

    // UserRole belongsTo Role via roleKey
    roleKeyRole!: Role;
    getRoleKeyRole!: Sequelize.BelongsToGetAssociationMixin<Role>;
    setRoleKeyRole!: Sequelize.BelongsToSetAssociationMixin<Role, RoleId>;
    createRoleKeyRole!: Sequelize.BelongsToCreateAssociationMixin<Role>;
    // UserRole belongsTo User via userId
    user!: User;
    getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof UserRole {
        UserRole.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                },
                roleKey: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    references: {
                        model: 'role',
                        key: 'key',
                    },
                },
                userId: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    references: {
                        model: 'user',
                        key: 'id',
                    },
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
                        fields: [{ name: 'id' }],
                    },
                    {
                        name: 'roleKey',
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
