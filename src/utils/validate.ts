import serverError from "./Error";
import validateType from "./validateType";

export default function(service: {
    required?: Record<string, string | string[]> | null;
    optional?: Record<string, string | string[]> | null;
}, data: any) {

    const required = service.required || {};
    const optional = service.optional || {};

    if (typeof data !== 'object') {

        return;
    }
    
    for (const k in required) {

        if (!(k in data)) {

            throw serverError('validate-01', 400, `Required field: ${k}`);
        }
    }

    const allFields = Object.keys(required).concat(...Object.keys(optional));

    for (const k in data) {

        if (k === 'identifier' && data[k].match(/\d{10,11}/)) {

            data[k] = data[k].padStart(11, '1');
        }

        if (!allFields.includes(k) && service.optional !== null) {

            throw serverError('validate-02', 400, `Invalid field: ${k}`);
        }

        if (k in required) {

            data[k] = validateType({ types: required[k], field: k }, data[k]);
        }
        else if (k in optional) {

            data[k] = validateType({ types: optional[k], field: k }, data[k]);
        }
    }
}