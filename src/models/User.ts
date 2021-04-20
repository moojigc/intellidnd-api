import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';
import bcrypt from 'bcryptjs';
import type { Token, TokenId } from './Token';
import type { UserRole, UserRoleId } from './UserRole';

export interface UserAttributes {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    emailValidatedAt?: number;
    lastLoginAt?: number;
    lastPasswordChangeAt?: number;
    discordId?: string;
    discordNickname?: string;
    discordUsername?: string;
    discordDiscriminator?: string;
    deletedAt?: number;
    createdAt: number;
    modifiedAt: number;
}

export type UserPk = 'id';
export type UserId = User[UserPk];
export type UserCreationAttributes = Optional<
    UserAttributes, UserPk | 'createdAt' | 'deletedAt' | 'modifiedAt' | 'lastLoginAt' | 'emailValidatedAt'
>;

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    id!: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email!: string;
    password!: string;
    emailValidatedAt?: number;
    lastLoginAt?: number;
    lastPasswordChangeAt?: number;
    discordId?: string;
    discordNickname?: string;
    discordUsername?: string;
    discordDiscriminator?: string;
    deletedAt?: number;
    createdAt!: number;
    modifiedAt!: number;

    // User hasMany Token via userId
    tokens!: Token[];
    getTokens!: Sequelize.HasManyGetAssociationsMixin<Token>;
    setTokens!: Sequelize.HasManySetAssociationsMixin<Token, TokenId>;
    addToken!: Sequelize.HasManyAddAssociationMixin<Token, TokenId>;
    addTokens!: Sequelize.HasManyAddAssociationsMixin<Token, TokenId>;
    createToken!: Sequelize.HasManyCreateAssociationMixin<Token>;
    removeToken!: Sequelize.HasManyRemoveAssociationMixin<Token, TokenId>;
    removeTokens!: Sequelize.HasManyRemoveAssociationsMixin<Token, TokenId>;
    hasToken!: Sequelize.HasManyHasAssociationMixin<Token, TokenId>;
    hasTokens!: Sequelize.HasManyHasAssociationsMixin<Token, TokenId>;
    countTokens!: Sequelize.HasManyCountAssociationsMixin;
    // User hasMany UserRole via userId
    roles!: UserRole[];
    getRoles!: Sequelize.HasManyGetAssociationsMixin<UserRole>;
    setRoles!: Sequelize.HasManySetAssociationsMixin<UserRole, UserRoleId>;
    addRole!: Sequelize.HasManyAddAssociationMixin<UserRole, UserRoleId>;
    addRoles!: Sequelize.HasManyAddAssociationsMixin<UserRole, UserRoleId>;
    createRole!: Sequelize.HasManyCreateAssociationMixin<UserRole>;
    removeRole!: Sequelize.HasManyRemoveAssociationMixin<
        UserRole,
        UserRoleId
    >;
    removeRoles!: Sequelize.HasManyRemoveAssociationsMixin<
        UserRole,
        UserRoleId
    >;
    hasRole!: Sequelize.HasManyHasAssociationMixin<UserRole, UserRoleId>;
    hasRoles!: Sequelize.HasManyHasAssociationsMixin<UserRole, UserRoleId>;
    countRoles!: Sequelize.HasManyCountAssociationsMixin;

    get name() {

        if (this.firstName) {

            return this.firstName + (
                this.lastName ? ' ' + this.lastName : ''
            );
        }
        else if (this.username) {

            return this.username;
        }
        else {

            return this.email;
        }
    }

    static initModel(sequelize: Sequelize.Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                },
                username: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                    unique: 'username',
                },
                firstName: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                lastName: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                    unique: 'email',
                },
                password: {
                    type: DataTypes.TEXT({ length: 'medium' }),
                    allowNull: false,
                },
                emailValidatedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                lastLoginAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                lastPasswordChangeAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                discordId: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                discordNickname: {
                    type: DataTypes.STRING(128),
                    allowNull: true,
                },
                discordUsername: {
                    type: DataTypes.STRING(128),
                    allowNull: true,
                },
                discordDiscriminator: {
                    type: DataTypes.STRING(4),
                    allowNull: true,
                },
                deletedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
                },
                modifiedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
                },
            },
            {
                sequelize,
                tableName: 'user',
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
                        name: 'email',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'email' }],
                    },
                    {
                        name: 'username',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'username' }],
                    },
                ],
                hooks: {
                    beforeValidate: (user) => {

                        if (user.password) {

                            user.password = bcrypt.hashSync(user.password);
                        }
                    }
                }
            }
        );
        return User;
    }
}
