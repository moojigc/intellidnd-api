import ServerError from './Error';

export default function(rules: { types: string | string[], field: string; }, data: any) {

    const types = Array.isArray(rules.types) ? rules.types : [rules.types];
    let ok = false;

    switch (typeof data) {

        case 'object':
            if (data === null) ok = types.includes('null');
            else ok = types.includes('object');
            break;
        case 'string':
            ok = types.includes('string') && data !== '';
            if (!ok) {

                ok = types.includes('email') && /^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/.test(data);
            }
            if (!ok) {

                ok = types.filter(t => new RegExp(t, 'i').test(data)).length > 0;
            }
            break;
        case 'number':
            ok = types.includes('number');
            if (!ok) {

                ok = types.includes('integer') && Number.isInteger(data);
            }
            break;
        default:
            ok = false;
    }

    if (!ok) {

        throw new ServerError('validate_type-01', 400, `${rules.field} must be type ${types}`);
    }
}