import type Sequelize from 'sequelize';

import { Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { Item } from './Item';
import Model from './Model';
import Wallet from './Wallet';

export interface InventoryAttributes {
    id: string;
    characterId: string;
    createdAt: number;
    modifiedAt: number;
};

export type InventoryPk = 'id';
export type InventoryCreationAttributes = Optional<
    InventoryAttributes, InventoryPk | 'createdAt' | 'modifiedAt'
>;

export class Inventory
    extends Model<InventoryAttributes, InventoryCreationAttributes>
    implements InventoryAttributes {

    id: string;
    characterId: string;
    createdAt: number;
    modifiedAt: number;

    items: Item[];
    getItems: Sequelize.HasManyGetAssociationsMixin<Item>;

    wallet: Wallet;
    getWallet: Sequelize.HasOneGetAssociationMixin<Wallet>;

    public static initModel(sequelize: Sequelize.Sequelize): typeof Inventory {
        Inventory.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ length: 40 })
                },
                characterId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    references: {
                        model: 'character',
                        key: 'id'
                    }
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
                tableName: 'inventory',
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
                        fields: [{ name: 'characterId' }],
                    },
                ],
            }
        );
        return Inventory;
    }
}
export default Inventory;