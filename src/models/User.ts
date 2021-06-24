
import Sequelize, { DataTypes, Op, Optional, WhereOptions } from 'sequelize';
import { Token, TokenId } from './Token';
import Model from './Model';
import { UserRole, UserRoleId } from './UserRole';
import Email, { EmailId } from './Email';
import Phone from './Phone';

export interface UserAttributes {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    emailAddress?: string;
    password?: string;
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
    UserAttributes, UserPk | 'createdAt' | 'deletedAt' | 'modifiedAt' | 'lastLoginAt'
>;

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    id!: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    emailAddress?: string;
    password?: string;
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

    async removeRole(key: string) {

        this.roles ??= await this.getRoles({
            where: {
                userId: this.id,
                roleKey: key
            }
        });

        for (const index in this.roles) {

            const role = this.roles[index];

            if (role.roleKey === key) {

                await role.destroy();
                this.roles.splice(Number(index));
            }
        }

        return this;
    }

    removeRoles!: Sequelize.HasManyRemoveAssociationsMixin<
        UserRole,
        UserRoleId
    >;
    hasRole!: Sequelize.HasManyHasAssociationMixin<UserRole, UserRoleId>;
    hasRoles!: Sequelize.HasManyHasAssociationsMixin<UserRole, UserRoleId>;
    countRoles!: Sequelize.HasManyCountAssociationsMixin;

    email: Email;
    getEmail: Sequelize.BelongsToGetAssociationMixin<Email>;

    emails: Email[];
    getEmails: Sequelize.HasManyGetAssociationsMixin<Email>;
    addEmail: Sequelize.HasManyAddAssociationMixin<Email, EmailId>;

    phone: Phone;
    getPhone: Sequelize.BelongsToGetAssociationMixin<Phone>;

    phones: Phone[];
    getPhones: Sequelize.HasManyGetAssociationsMixin<Phone>;

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
            email: this.emailAddress,
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

            return this.emailAddress;
        }
    }

    public static async lookup(lookup: string | WhereOptions<UserAttributes> & { identifier?: string; }) {

        const include = [
            {
                model: UserRole,
                as: 'roles'
            },
            {
                model: Phone,
                as: 'phone'
            },
            {
                model: Email,
                as: 'email'
            }
        ];

        if (typeof lookup === 'string') {

            lookup = { id: lookup };
        }
        else if ('identifier' in lookup) {

            lookup = {
                [Op.or]: {
                    phoneNumber: lookup.identifier,
                    emailAddress: lookup.identifier,
                    username: lookup.identifier
                }
            };
        }

        return await this.findOne({
            include,
            where: lookup
        });
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ prefix: 'U-', length: 16 })
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
                emailAddress: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                    unique: 'email',
                    references: {
                        model: 'email',
                        key: 'address'
                    },
                    validate: {
                        isEmail: true
                    }
                },
                phoneNumber: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    references: {
                        model: 'phone',
                        key: 'number'
                    },
                    get() {
                        return this.getDataValue('phoneNumber');
                    },
                    set(p: string) {
                        this.setDataValue(
							'phoneNumber',
							p
								.split('')
								.filter((r) => /\d/.test(r))
								.join('')
								.padStart(12, '+1')
						);
                    }
                },
                password: {
                    type: DataTypes.TEXT({ length: 'medium' }),
                    allowNull: false,
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