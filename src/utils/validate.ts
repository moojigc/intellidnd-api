import Service from '@lib/Service';
import serverError from './Error';
import validateType from './validateType';

export default function(service: Service, payload: any) {

    const required = service.payload?.required || {};
    const optional = service.payload?.optional || {};

    if (typeof payload !== 'object') {

        return;
    }
    
    for (const k in required) {

        if (!(k in payload)) {

            throw new Service.ServiceError('validate-01', 400, `Required field: ${k}`);
        }
    }

    const allFields = Object.keys(required).concat(...Object.keys(optional));

    for (const k in payload) {

        if (k === 'identifier' && payload[k].match(/\d{10,11}/)) {

            payload[k] = payload[k].padStart(11, '1');
        }

        if (!allFields.includes(k) && service.payload?.optional !== null) {

            throw new Service.ServiceError('validate-02', 400, `Invalid field: ${k}`);
        }

        if (k in required) {

            payload[k] = validateType({ types: required[k], field: k }, payload[k]);
        }
        else if (k in optional) {

            payload[k] = validateType({ types: optional[k], field: k }, payload[k]);
        }
    }
}