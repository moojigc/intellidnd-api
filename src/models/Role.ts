import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { UserRole, UserRoleId } from './UserRole';

export interface RoleAttributes {
    key: string;
    displayName: string;
}

export type RolePk = 'key';
export type RoleId = Role[RolePk];
export type RoleCreationAttributes = Optional<RoleAttributes, RolePk>;

export class Role
    extends Model<RoleAttributes, RoleCreationAttributes>
    implements RoleAttributes {
    key!: string;
    displayName!: string;

    // Role hasMany UserRole via roleKey
    userRoles!: UserRole[];
    getUserRoles!: Sequelize.HasManyGetAssociationsMixin<UserRole>;
    setUserRoles!: Sequelize.HasManySetAssociationsMixin<UserRole, UserRoleId>;
    addUserRole!: Sequelize.HasManyAddAssociationMixin<UserRole, UserRoleId>;
    addUserRoles!: Sequelize.HasManyAddAssociationsMixin<UserRole, UserRoleId>;
    createUserRole!: Sequelize.HasManyCreateAssociationMixin<UserRole>;
    removeUserRole!: Sequelize.HasManyRemoveAssociationMixin<
        UserRole,
        UserRoleId
    >;
    removeUserRoles!: Sequelize.HasManyRemoveAssociationsMixin<
        UserRole,
        UserRoleId
    >;
    hasUserRole!: Sequelize.HasManyHasAssociationMixin<UserRole, UserRoleId>;
    hasUserRoles!: Sequelize.HasManyHasAssociationsMixin<UserRole, UserRoleId>;
    countUserRoles!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof Role {
        Role.init(
            {
                key: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    primaryKey: true,
                },
                displayName: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    unique: 'displayName',
                },
            },
            {
                sequelize,
                tableName: 'role',
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'key' }],
                    },
                    {
                        name: 'displayName',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'displayName' }],
                    },
                ],
            }
        );
        return Role;
    }
}

export default Role;