import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';

export interface PhoneAttributes {
    number: string;
    userId: string;
    createdAt: number;
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

    static initModel(sequelize: Sequelize.Sequelize): typeof Phone {
        Phone.init(
            {
                number: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    primaryKey: true
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
