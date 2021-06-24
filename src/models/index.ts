export type { RollAttributes, RollCreationAttributes } from './Roll';
export type { Roll };
import type { Sequelize, Dialect } from 'sequelize';
import type Roll from './Roll';
import type { Token } from './Token';
import type { User } from './User';
import type { Role } from './Role';
import type { UserRole } from './UserRole';
import type { Character } from './Character';
import type { Inventory } from './Inventory';
import type Code from './Code';
import type Wallet from './Wallet';
import type { Item } from './Item';
import type GuildUser from './GuildUser';
import type Email from './Email';

import { readdirSync } from 'fs';
import { Sequelize as SeqLibrary } from 'sequelize';
import { actions, backgrounds, colors, reset } from '../utils/print';
import Phone from './Phone';

interface DB {
    Roll: typeof Roll,
    Token: typeof Token,
    User: typeof User,
    UserRole: typeof UserRole,
    Role: typeof Role,
    Code: typeof Code,
    Character: typeof Character,
    Inventory: typeof Inventory,
    Wallet: typeof Wallet,
    Item: typeof Item,
    GuildUser: typeof GuildUser,
    Email: typeof Email,
    Phone: typeof Phone
};

export function initSequelize({
    INTELLIDND_DB_HOST,
    INTELLIDND_DB_NAME,
    INTELLIDND_DB_USER,
    INTELLIDND_DB_PASS,
    INTELLIDND_DB_DIALECT,
    DB_LOGGING
}: NodeJS.ProcessEnv) {

    const log = (str: string) => {
        str = str
            .replace(
                /executing \(.*?\):/gi,
                colors.black + backgrounds.bgWhite + ' SEQUELIZE: ' + reset
            )
            .replace(
                /START TRANSACTION/g,
                colors.magenta +
                    backgrounds.bgWhite +
                    actions.underscore +
                    'START TRANSACTION' +
                    reset
            )
            .replace(
                /COMMIT/g,
                colors.magenta +
                    backgrounds.bgWhite +
                    actions.underscore +
                    'COMMIT' +
                    reset
            )
            .replace(
                /ROLLBACK/g,
                colors.magenta +
                    backgrounds.bgWhite +
                    actions.underscore +
                    'ROLLBACK' +
                    reset
            )
            .replace(/SELECT/g, colors.green + 'SELECT' + reset)
            .replace(
                /INSERT/g,
                colors.yellow + backgrounds.bgWhite + ' INSERT ' + reset
            )
            .replace(/UPDATE/g, colors.yellow + 'UPDATE' + reset)
            .replace(
                /DELETE/g,
                colors.white + backgrounds.bgRed + ' DELETE ' + reset
            )
            .replace(/AS `(.*?)`/g, '')
            .replace(/  /g, ' ')
            .replace(
                /WHERE/g,
                colors.black + backgrounds.bgWhite + ' WHERE ' + reset
            )
            .split(/`/)
            .map((s) => colors.cyan + s + reset)
            .join('')
            .split(/'/)
            .map((s) => colors.white + s + reset)
            .join("'");

        console.log(str + '\n');
    };
    
    const sequelize = new SeqLibrary({
        host: INTELLIDND_DB_HOST,
        username: INTELLIDND_DB_USER,
        password: INTELLIDND_DB_PASS,
        database: INTELLIDND_DB_NAME,
        dialect: INTELLIDND_DB_DIALECT as Dialect,
        logging: DB_LOGGING ? log : false,
        logQueryParameters: true
    });

    return sequelize;
}
// @ts-ignore
const db: DB = {};

export function initModels(sequelize: Sequelize) {

    const models = readdirSync(__dirname);
    const r = (s: string) => __dirname + '/' + s;
    
    for (const model of models) {

        if (
            /Model(.js|.ts)/.test(r(model)) ||
            r(model) === __filename
        ) {
            continue;
        }
        try {

            const initialized = require(r(model)).default.initModel(sequelize);
            db[initialized.name] = initialized;
        }
        catch (e) {

            console.log('File: ' + model);
            console.log(e);
            process.exit(1);
        }
    }

    db.User.hasMany(db.UserRole, {
        foreignKey: 'userId',
        as: 'roles'
    });
    db.User.hasMany(db.Token, {
        foreignKey: 'userId',
        as: 'tokens'
    });
    db.User.hasMany(db.Code, {
        foreignKey: 'userId',
        as: 'codes'
    });
    db.User.hasMany(db.Roll, {
        foreignKey: 'userId',
        as: 'rolls'
    });
    db.User.hasMany(db.Character, {
        foreignKey: 'userId',
        as: 'characters'
    });
    db.User.hasMany(db.Phone, {
        foreignKey: 'userId',
        as: 'phones'
    });
    db.User.belongsTo(db.Phone, {
        foreignKey: 'phoneNumber',
        as: 'phone'
    });
    db.User.hasMany(db.Email, {
        foreignKey: 'userId',
        as: 'emails'
    });
    db.User.belongsTo(db.Email, {
        foreignKey: 'emailAddress',
        as: 'email'
    });
    db.Token.belongsTo(db.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    db.Roll.belongsTo(db.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    db.Code.belongsTo(db.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    db.Character.hasOne(db.Inventory, {
        foreignKey: 'characterId',
        as: 'inventory'
    });
    db.Inventory.hasMany(db.Item, {
        foreignKey: 'inventoryId',
        as: 'items'
    });
    db.Inventory.hasOne(db.Wallet, {
        foreignKey: 'inventoryId',
        as: 'wallet'
    });

    return db;
}
