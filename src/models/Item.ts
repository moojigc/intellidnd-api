import type Sequelize from 'sequelize';

import { Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import Model from './Model';

export interface ItemAttributes {
    id: string;
    name: string;
    inventoryId: string;
    type: 'potion' | 'weapon' | 'misc';
    value?: number;
    createdAt: number;
    modifiedAt: number;
};
export type ItemPk = 'id';
export type ItemId = Item[ItemPk];
export type ItemCreationAttributes = Optional<
    ItemAttributes, ItemPk | 'createdAt' | 'modifiedAt'
>;

export class Item
    extends Model<ItemAttributes, ItemCreationAttributes>
    implements ItemAttributes {

    id: string;
    name: string;
    inventoryId: string;
    type: 'potion' | 'weapon' | 'misc';
    value?: number;
    createdAt: number;
    modifiedAt: number;

    public static initModel(sequelize: Sequelize.Sequelize): typeof Item {
        Item.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ prefix: 'ITEM', length: 21 })
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                type: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    defaultValue: 'misc'
                },
                inventoryId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    references: {
                        model: 'inventory',
                        key: 'id'
                    }
                },
                value: {
                    type: DataTypes.INTEGER,
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
                }
            },
            {
                sequelize,
                tableName: 'item',
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'id' }],
                    },
                    {
                        name: 'userId',
                        unique: false,
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return Item;
    }
}