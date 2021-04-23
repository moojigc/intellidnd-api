export type { RollAttributes, RollCreationAttributes } from './Roll';
export type { Roll };
import type { Sequelize, Dialect } from 'sequelize';

import { Sequelize as SeqLibrary } from 'sequelize';
import Roll from './Roll';
import { actions, backgrounds, colors, reset } from '../utils/print';
import { Token } from './Token';
import { User } from './User';
import { Role } from './Role';
import { UserRole } from './UserRole';
import Code from './Code';

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

export function initModels(sequelize: Sequelize) {

    Roll.initModel(sequelize);
    Token.initModel(sequelize);
    User.initModel(sequelize);
    Role.initModel(sequelize);
    UserRole.initModel(sequelize);
    Code.initModel(sequelize);

    User.hasMany(UserRole, {
        foreignKey: 'userId',
        as: 'roles'
    });
    User.hasMany(Token, {
        foreignKey: 'userId',
        as: 'tokens'
    });
    User.hasMany(Code, {
        foreignKey: 'userId',
        as: 'codes'
    });
    Token.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    User.hasMany(Roll, {
        foreignKey: 'userId',
        as: 'rolls'
    });
    Roll.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    Code.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    return { Roll, Token, User, UserRole, Role, Code };
}
