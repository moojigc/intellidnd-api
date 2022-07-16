import Sequelize, { WhereOptions } from 'sequelize/types';
import { Model as SqlModel, ValidationError, ValidationErrorItem } from 'sequelize';
import { customAlphabet, nanoid } from 'nanoid';

export default class Model<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = any
> extends SqlModel<TModelAttributes, TCreationAttributes> {

    public static createId(options?: {
        prefix?: string;
        length?: number;
        characters?: string;
    }) {

        const { prefix, length, characters } = options || {};

        let ret = '';

        if (prefix) { ret += prefix; }

        const fn = characters
            ? customAlphabet(characters, length || 16)
            : () => nanoid(length || 16)

        ret += fn();

        return ret;
    }

    public static async findUnknown<M extends Model<any, any>>(where: WhereOptions<M['_attributes']>)  {

        return await this.unknownLookup('findOne', where) as Promise<M | null>;
    }
    public static async findAllUnknown<M extends Model<any, any>>(where: WhereOptions<M['_attributes']>) {

        return await this.unknownLookup('findAll', where) as Promise<M[]>;
    }
    public static async unknownLookup<M extends Model<any, any>>(
        fn: 'findOne' | 'findAll', where: WhereOptions<M['_attributes']>
    ): Promise<any> {

        for (const f in where) {
            
            if (where[f] === undefined) {

                delete where[f];
            }
        }

        if (Object.keys(where).length === 0) {

            return null;
        }

        // @ts-ignore
        return await this[fn]({ where });
    }
}