import Sequelize, { DataTypes, Op, Optional } from 'sequelize';
import Model from './Model';
import jwt from 'jsonwebtoken';
import type { User, UserId } from './User';
export interface TokenAttributes {
    id: string;
    jwt: string;
    userId: string;
    createdAt: number;
    expiresAt: number | null;
    roles: string[];
}

export type TokenPk = 'id';
export type TokenId = Token[TokenPk];
export type TokenCreationAttributes = Optional<
	TokenAttributes,
	TokenPk | 'createdAt'
>

// @ts-ignore
export class Token
    extends Model<TokenAttributes, TokenCreationAttributes>
    implements TokenAttributes {
    id!: string;
    jwt!: string;
    userId!: string;
    createdAt!: number;
    expiresAt: number | null;
    roles!: string[];

    private static _expirationMap = {
        verification: 1000 * 60 * 60,
        session: 1000 * 60 * 60 * 24,
        sessionLong: 1000 * 60 * 60 * 24 * 14
    };

    /**
     * @returns a flat object, not a Token instance
     */
    public static async generate({
        userId,
        roles,
        expires
    }: {
        userId: string;
        roles: string[];
        expires: 'verification' | 'session' | 'sessionLong'
    }, transaction?: Sequelize.Transaction) {

        await this.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: Date.now() 
                },
                userId: userId
            },
            transaction
        });

        const id = this.createId();

        const token = jwt.sign({
            id: id,
            userId: userId
        }, process.env.TOKEN_SECRET!, expires ? {
            expiresIn: this._expirationMap[expires]
        } : {});

        await this.create({
            id,
            jwt: token,
            userId,
            expiresAt: expires ? this._expirationMap[expires] : null,
            roles
        }, { transaction });

        return {
            id: id,
            jwt: token,
            userId: userId,
            roles: roles,
            expiresAt: expires ? this._expirationMap[expires] : null
        };
    }

    public async getRolesMap() {

        const ret: Record<string, true> = {};

        for (const r of this.roles) {

            ret[r] = true;
        }

        return ret;
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
                expiresAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                roles: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    defaultValue: []
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
