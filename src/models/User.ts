
import Sequelize, { DataTypes, Optional, WhereOptions } from 'sequelize';
import { Token, TokenId } from './Token';
import Model from './Model';
import bcrypt from 'bcryptjs';
import { UserRole, UserRoleId } from './UserRole';
import Code from './Code';
import Roll from './Roll';
import Character from './Character';

export interface UserAttributes {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    phoneVerifiedAt?: number;
    email?: string;
    password?: string;
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
    phone?: string;
    phoneVerifiedAt?: number;
    email?: string;
    password?: string;
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

    public async getRolesMap() {

        const ret: Record<string, true> = {};
        const roles = (this.roles || await this.getRoles());

        for (const r of roles) {

            ret[r.roleKey] = true;
        }

        return ret;
    }

    public getProfile() {

        return {
            id: this.id,
            email: this.email,
            username: this.username,
            name: this.name,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles?.map(r => r.roleKey) || null,
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt,
            lastLoginAt: this.lastLoginAt
        }
    }

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

    public static async lookup(lookup: string | WhereOptions<UserAttributes>) {

        if (typeof lookup === 'string') {

            lookup = { id: lookup };
        }

        return await this.findOne({
            where: lookup,
            include: {
                model: UserRole,
                as: 'roles'
            }
        });
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ prefix: 'U', length: 16 })
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
                    validate: {
                        isEmail: true
                    }
                },
                phone: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    validate: {
                        is: /\d{10}|\+(\d{11})/
                    }
                },
                phoneVerifiedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
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
                
            }
        );
        return User;
    }
}

export default User;