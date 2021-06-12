import type Sequelize from 'sequelize';
import { Op, Optional, WhereOptions } from 'sequelize';
import { DataTypes } from 'sequelize';
import Model from './Model';

export interface RollAttributes {
    id: string;
    name: string;
    discordUserId?: string;
    userId?: string;
    guildId?: string;
    input: string;
    lastRolledAt: number;
    createdAt: number;
    modifiedAt: number;
};

export type RollCreationAttributes = Optional<
    RollAttributes, 'id' | 'createdAt' | 'modifiedAt'
>;

export default class Roll
    extends Model<RollAttributes, RollCreationAttributes>
    implements RollAttributes {

    id: string;
    name: string;
    discordUserId?: string;
    userId?: string;
    guildId?: string;
    input: string;
    lastRolledAt: number;
    createdAt: number;
    modifiedAt: number;

    public static get(name: string, discordUserId: string, guildId?: string) {

        return this.findOne({
            where: {
                name,
                discordUserId,
                guildId
            }
        });
    }

    public static getAllByDiscordUserId(discordUserId: string, guildId?: string, input?: string | null) {

        const where: WhereOptions<RollAttributes> = {
            discordUserId
        };

        if (guildId) { where.guildId = guildId; }
        if (input) {
            where.name = {
                [Op.like]: '%' + input + '%'
            };
        }

        return this.findAll({
            where: where
        });
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof Roll {
        Roll.init(
            {
                id: {
                    type: DataTypes.STRING(21),
                    allowNull: false,
                    defaultValue: () => this.createId({ length: 21 }),
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                },
                guildId: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    defaultValue: 'global'
                },
                discordUserId: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                userId: {
                    type: DataTypes.STRING(64),
                    allowNull: true
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
                        fields: [{ name: 'id' }],
                    },
                    {
                        name: 'discordUserId',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'name' }, { name: 'discordUserId' }, { name: 'guildId' }],
                    },
                ],
            }
        );
        return Roll;
    }
}