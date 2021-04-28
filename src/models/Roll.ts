import type { Optional } from 'sequelize';
import type Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import Model from './Model';

export interface RollAttributes {
    name: string;
    userId: string;
    guildId?: string;
    input: string;
    lastRolledAt: number;
    createdAt: number;
    modifiedAt: number;
};

export type RollCreationAttributes = Optional<
    RollAttributes, 'createdAt' | 'modifiedAt'
>;

export default class Roll
    extends Model<RollAttributes, RollCreationAttributes>
    implements RollAttributes {

    name: string;
    userId: string;
    guildId?: string;
    input: string;
    lastRolledAt: number;
    createdAt: number;
    modifiedAt: number;

    public static get(name: string, userId: string, guildId?: string) {

        return this.findOne({
            where: {
                name,
                userId,
                guildId
            }
        });
    }

    public static getAllByUserId(userId: string, guildId?: string) {

        const where: {
            userId: string;
            guildId?: string;
        } = {
            userId
        };

        if (guildId) { where.guildId = guildId; }

        return this.findAll({
            where: where
        });
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof Roll {
        Roll.init(
            {
                name: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    primaryKey: true,
                },
                guildId: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    defaultValue: 'global'
                },
                userId: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                input: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                lastRolledAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
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
                tableName: 'roll',
                hasTrigger: true,
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'name' }, { name: 'userId' }, { name: 'guildId' }],
                    },
                ],
            }
        );
        return Roll;
    }
}