import type Sequelize from 'sequelize';

import { Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import Model from './Model';

export interface GuildUserAttributes {
    userId: string;
    guildId: string;
    createdAt: number;
};

export type GuildUserCreationAttributes = Optional<
    GuildUserAttributes, 'createdAt'
>;
export default class GuildUser
    extends Model<GuildUserAttributes, GuildUserCreationAttributes>
    implements GuildUserAttributes {

    userId: string;
    guildId: string;
    createdAt: number;

    public static initModel(sequelize: Sequelize.Sequelize): typeof GuildUser {
        GuildUser.init(
            {
                userId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    references: {
                        model: 'user',
                        key: 'id'
                    }
                },
                guildId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                },
                createdAt: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                    defaultValue: Date.now
                }
            },
            {
                sequelize,
                tableName: 'guildUser',
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'userId' }, { name: 'guildId' }],
                    }
                ],
            }
        );
        return GuildUser;
    }
}