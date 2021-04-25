import type Sequelize from 'sequelize';

import { Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import Model from './Model';

export interface WalletAttributes {
    id: string;
    inventoryId: string;
    copper: number;
    gold: number;
    silver: number;
    platinum: number;
    electrum: number;
    createdAt: number;
    modifiedAt: number;
};

export type WalletPk = 'id';
export type WalletCreationAttributes = Optional<
    WalletAttributes, WalletPk | 'createdAt' | 'modifiedAt' | 'copper' | 'electrum' | 'gold' | 'platinum' | 'silver'
>;

export default class Wallet
    extends Model<WalletAttributes, WalletCreationAttributes>
    implements WalletAttributes {

    id: string;
    userId: string;
    inventoryId: string;
    copper: number;
    gold: number;
    silver: number;
    platinum: number;
    electrum: number;
    createdAt: number;
    modifiedAt: number;

    /**
     * Total in gold
     */
    get total() {

        return Number((
            (this.copper / 100) + 
            (this.gold) +
            (this.silver / 10) +
            (this.electrum / 5) +
            (this.platinum * 10)
        ).toFixed(2))
    }

    get coins() {

        return {
            copper: this.copper,
            gold: this.gold,
            silver: this.silver,
            platinum: this.platinum,
            electrum: this.electrum,
            total: this.total
        };
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof Wallet {
        Wallet.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ prefix: 'W', length: 30 })
                },
                inventoryId: {
                    type: DataTypes.STRING(40),
                    allowNull: true,
                    references: {
                        model: 'inventory',
                        key: 'id'
                    }
                },
                copper: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                silver: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                electrum: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                gold: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                platinum: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
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
                tableName: 'wallet',
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
        return Wallet;
    }
}