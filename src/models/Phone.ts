import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';
import User from './User';

export interface PhoneAttributes {
    number: string;
    userId: string;
    createdAt: number;
    verifiedAt?: number;
}

export type PhoneId = Phone['userId'] & Phone['number']
export type PhoneCreationAttributes = Optional<
    PhoneAttributes,
    'createdAt'
>;

export class Phone
    extends Model<PhoneAttributes, PhoneCreationAttributes>
    implements PhoneAttributes {
    number!: string;
    userId!: string;
    createdAt!: number;
    verifiedAt?: number;

    getUser: Sequelize.BelongsToGetAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof Phone {
        Phone.init(
            {
                number: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    primaryKey: true,
                    set(p: string) {
                        this.setDataValue(
                            'number',
                            p.split('')
                            .filter((r) => /\d/.test(r))
                            .join('')
                        )
                    },
                    get() {
                        return this.getDataValue('number');
                    }
                },
                userId: {
                    type: DataTypes.STRING(40),
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
                verifiedAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true
                }
            },
            {
                sequelize,
                tableName: 'phone',
                hasTrigger: true,
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'number' }, { name: 'userId' }],
                    },
                    {
                        name: 'userId',
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return Phone;
    }
}

export default Phone;