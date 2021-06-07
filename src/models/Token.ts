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
        verification: {
            refresh: 1000 * 60 * 60 * 24,
            auth: 1000 * 60 * 60,
        },
        session: {
            refresh: 1000 * 60 * 60 * 24 * 7,
            auth: 1000 * 60 * 5
        },
    };

    public static async verifyRefresh(token: string) {

        try {

            const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as {
                id: string;
                userId: string;
            };

            const saved = await this.findOne({
                where: {
                    id: decoded.id,
                    expiresAt: {
                        [Op.gt]: Date.now()
                    }
                }
            });

            if (!saved) {

                return false;
            }
            
            return {
                ...decoded,
                session: saved
            };
        }
        catch (e) {

            return false;
        }
    }

    private static _getJwt(payload: {
        id: string;
        userId: string;
    } | {
        userId: string;
        roles: string;
    }, type: 'refresh' | 'auth', expiresIn: number | null) {

        const secret = {
            refresh: 'REFRESH_SECRET',
            auth: 'TOKEN_SECRET'
        };
        
        return jwt.sign(
			payload,
			process.env[secret[type]]!,
			expiresIn
				? {
                    expiresIn: expiresIn
				  }
				: {}
		);
    };

    public static getAuthToken(payload: {
        userId: string;
        roles: string;
    }) {

        const token = this._getJwt(payload, 'auth', this._expirationMap.session.auth);

        return {
            token: token,
            expiresAt: Date.now() + this._expirationMap.session.auth
        };
    }

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
        expires: 'verification' | 'session';
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

        const refreshToken = this._getJwt(
			{
				id: id,
				userId: userId,
			},
			'refresh',
			expires
				? Math.ceil(this._expirationMap[expires].refresh / 1000)
				: null
		);

		const authToken = this._getJwt(
			{
				userId: userId,
				roles: roles.join(','),
			},
			'auth',
			Math.ceil(this._expirationMap[expires].auth / 1000)
		);

        await this.create({
            id,
            jwt: refreshToken,
            userId,
            expiresAt: expires ? Date.now() + this._expirationMap[expires].refresh : null,
            roles
        }, { transaction });

        return {
            id: id,
            authToken: authToken,
            refreshToken: refreshToken,
            userId: userId,
            roles: roles,
            expiresAt: expires ? Date.now() + this._expirationMap[expires].auth : null,
            sessionExpiresAt: Date.now() + this._expirationMap[expires].refresh
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
