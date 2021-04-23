import Sequelize from 'sequelize/types';
import { Model as SqlModel, ValidationError, ValidationErrorItem } from 'sequelize';
import { customAlphabet } from 'nanoid';

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

        ret += customAlphabet(characters ?? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 30)();

        return ret;
    }

    public static async create<M extends Model<any, any>>(
        this: Sequelize.ModelStatic<M>,
        values?: M['_creationAttributes'],
        options?: Sequelize.CreateOptions<M['_attributes']>
    ): Promise<M> {

        // @ts-ignore
        const build = this.build(values);

        try {
            
            const res = await build.save(options);

            return res;
        }
        catch (e) {

            console.log(e);
            
            if (options?.transaction) {

                await options?.transaction.rollback();
            }

            if (e instanceof ValidationError || e instanceof ValidationErrorItem) {

                const msg = e instanceof ValidationError ? e.errors[0].message : e.message;

                throw {
                    code: 'validation-01',
                    status: 400,
                    message: msg
                };
            }
            else {

                throw {
                    code: 'db-01',
                    status: 500,
                    message: e.message || e
                };
            }
        }
    }
}