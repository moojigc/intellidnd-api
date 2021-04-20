import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';
import jwt from 'jsonwebtoken';
import type { User, UserId } from './User';
export interface TokenAttributes {
    id: string;
    jwt: string;
    userId: string;
    createdAt: number;
    revokedAt?: number;
    roles: any;
}

export type TokenPk = 'id';
export type TokenId = Token[TokenPk];
export type TokenCreationAttributes = Optional<TokenAttributes, TokenPk | 'createdAt' | 'jwt'> & { expires: number; };

export class Token
    extends Model<TokenAttributes, TokenCreationAttributes>
    implements TokenAttributes {
    id!: string;
    jwt!: string;
    userId!: string;
    createdAt!: number;
    revokedAt?: number;
    roles!: any;

    public static async create<T extends Model<any, any>>(
        this: Sequelize.ModelStatic<T>,
        values: TokenCreationAttributes,
        options?: Sequelize.CreateOptions<Token>
    ): Promise<T> {

        // @ts-ignore
        const id = this.createId();

        const token = jwt.sign({
            id: id,
            roles: values.roles
        }, process.env.TOKEN_SECRET, values.expires ? {
            expiresIn: values.expires
        } : {});

        delete values.expires;

        // @ts-ignore
        const build = this.build({
            id: id,
            jwt: token,
            ...values,
        }, options);

        try {

            return await build.save(options);
        }
        catch (e) {

            throw {
                code: '108-01',
                status: 500,
                message: e.errors && e.errors[0]?.message || e.original?.message || e.message || e
            };
        }
    }

    // Token belongsTo User via userId
    user!: User;
    getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof Token {
        Token.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                },
                jwt: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                userId: {
                    type: DataTypes.STRING(40),
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
                revokedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                roles: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'token',
                hasTrigger: true,
                timestamps: false,
                indexes: [
                    {
                        name: 'userId',
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return Token;
    }
}
