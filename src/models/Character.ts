import Sequelize, { DataTypes, Optional, WhereOptions } from 'sequelize';
import Model from './Model';
import { Inventory } from './Inventory';
import { Item } from './Item';
import Wallet from './Wallet';

export interface CharacterAttributes {
    id: string;
    userId: string;
    guildId?: string;
    name: string;
    race?: string;
    class?: string;
    background?: string;
    experience: number;
    level: number;
    maxHp: number;
    hp: number;
    armorClass: number;
    initiative: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    createdAt: number;
    modifiedAt: number;
}

export type CharacterPk = 'id';
export type CharacterId = Character[CharacterPk];
export type CharacterCreationAttributes = Optional<
	CharacterAttributes,
	| CharacterPk
	| 'createdAt'
	| 'modifiedAt'
	| 'armorClass'
	| 'experience'
	| 'initiative'
	| 'hp'
	| 'maxHp'
	| 'level'
	| 'strength'
    | 'charisma'
    | 'constitution'
    | 'dexterity'
    | 'intelligence'
    | 'wisdom'
>;

export class Character
    extends Model<CharacterAttributes, CharacterCreationAttributes>
    implements CharacterAttributes {
    id: string;
    userId: string;
    guildId?: string;
    name: string;
    race?: string;
    class?: string;
    background?: string;
    experience: number;
    level: number;
    maxHp: number;
    hp: number;
    armorClass: number;
    initiative: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    createdAt: number;
    modifiedAt: number;

    getInventory: Sequelize.HasOneGetAssociationMixin<Inventory>;

    private static _include: Sequelize.Includeable = {
        model: Inventory,
        as: 'inventory',
        include: [
            {
                model: Item,
                as: 'items'
            },
            {
                model: Wallet,
                as: 'wallet'
            }
        ]
    };

    public static async lookupAll(where: WhereOptions<CharacterAttributes>) {

        return await this.findAll({
            where,
            include: this._include
        }) as Array<Character & {
            inventory: Inventory
        }>;
    }

    public static async lookup(where: string | WhereOptions<CharacterAttributes>) {

        if (typeof where === 'string') {

            where = { id: where };
        }

        return await this.findOne({
            where: where,
            include: this._include
        }) as Character & {
            inventory: Inventory
        };
    }

    public static initModel(sequelize: Sequelize.Sequelize): typeof Character {
        Character.init(
            {
                id: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: () => this.createId({ prefix: 'C', length: 30 })
                },
                userId: {
                    type: DataTypes.STRING(40),
                    allowNull: false,
                    references: {
                        model: 'user',
                        key: 'id'
                    }
                },
                guildId: {
                    type: DataTypes.STRING(128),
                    allowNull: true
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                race: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                level: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: 1,
                },
                class: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                background: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                experience: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                armorClass: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                maxHp: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 1,
                },
                hp: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 1,
                },
                initiative: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                strength: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                dexterity: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                constitution: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                intelligence: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                wisdom: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                charisma: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
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
                tableName: 'character',
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
                        name: 'userId',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'userId' }],
                    },
                ],
            }
        );
        return Character;
    }
}
