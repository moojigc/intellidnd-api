import type Sequelize from 'sequelize';
import type { Transaction } from 'sequelize/types';
import { Optional, ValidationErrorItem } from 'sequelize';
import { DataTypes } from 'sequelize';
import err from '../utils/Error';
import Model from './Model';

export interface CodeAttributes {
    data: string;
    type: 'verification';
    parentId?: string;
    parentEntity?: 'phone' | 'email' | 'password';
    userId: string;
    expiresAt?: number;
    createdAt: number;
};

export type CodeCreationAttributes = Optional<
    CodeAttributes, 'createdAt'
>;

export default class Code
    extends Model<CodeAttributes, CodeCreationAttributes>
    implements CodeAttributes {

    data: string;
    type: 'verification';
    parentId?: string;
    parentEntity?: 'phone' | 'email' | 'password';
    userId: string;
    expiresAt?: number;
    createdAt: number;

    private static _expirations = {
        /** 5 minutes */
        verification: 1000 * 60 * 5
    };

    public static async createVerificationCode(userId: string, options?: {
        transaction?: Transaction;
        parentId?: string;
        parentEntity?: Code['parentEntity'];
    }): Promise<Code> {

        options ??= {};
        try {

            if (options.parentId || options.parentEntity) {

                await this.destroy({
                    where: {
                        userId: userId,
                        type: 'verification',
                        parentEntity: options.parentEntity,
                        parentId: options.parentId
                    },
                    transaction: options.transaction
                });
            }

            return await this.create({
                data: this.createId({ length: 6, characters: '0123456789' }),
                type: 'verification',
                userId: userId,
                parentId: options.parentId,
                parentEntity: options.parentEntity,
                expiresAt: this._expirations.verification
            }, { transaction: options.transaction });
        }
        catch (e) {

            if (e instanceof ValidationErrorItem && e.type === 'unique violation') {

                return await this.createVerificationCode(userId);
            }

            throw e;
        }
    }

    public static async verify(userId: string, code: string) {

        const c = await this.findOne({
            where: {
                userId,
                data: code,
            }
        });

        if (!c) {

            throw err('code-01', 404, 'Code not found');
        }
        else if (c.expiresAt && c.expiresAt <= Date.now()) {

            throw err('code-02', 401, 'Code is expired');
        }

        await c.destroy();
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof Code {
        Code.init(
            {
                data: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId()
                },
                type: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    defaultValue: 'verification'
                },
                parentId: {
                    type: DataTypes.STRING(64),
                    allowNull: true
                },
                parentEntity: {
                    type: DataTypes.STRING('64'),
                    allowNull: true
                },
                userId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    references: {
                        model: 'user',
                        key: 'id'
                    }
                },
                createdAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
                }
            },
            {
                sequelize,
                tableName: 'code',
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'data' }],
                    },
                ],
            }
        );
        return Code;
    }
}