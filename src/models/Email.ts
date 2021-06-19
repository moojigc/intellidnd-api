import Sequelize, { DataTypes, Optional } from 'sequelize';
import Model from './Model';

export interface EmailAttributes {
    address: string;
    userId: string;
    createdAt: number;
}

export type EmailId = Email['userId'] & Email['address']
export type EmailCreationAttributes = Optional<
    EmailAttributes,
    'createdAt'
>;

export class Email
    extends Model<EmailAttributes, EmailCreationAttributes>
    implements EmailAttributes {
    address!: string;
    userId!: string;
    createdAt!: number;

    static initModel(sequelize: Sequelize.Sequelize): typeof Email {
        Email.init(
            {
                address: {
                    type: DataTypes.STRING(128),
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
                tableName: 'email',
                hasTrigger: true,
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'address' }, { name: 'userId' }],
                    },
                    {
                        name: 'userId',
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return Email;
    }
}
export default Email;