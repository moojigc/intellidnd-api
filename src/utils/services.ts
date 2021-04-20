import type { Sequelize } from 'sequelize/types';
import type { Service } from '../types';

import fs from 'fs';
import { Op } from 'sequelize';
import { Router } from 'express';

import verifyToken from './verifyToken';
import Open5e from '../externalServices/Open5e';
import { actions, backgrounds, colors, reset } from './print';
import ServerError from './Error';

const serviceFolder = __dirname.replace('utils', 'services');
const prefix = '/' + (process.env.VERSION_PREFIX || 'v1');

export default function(data: {
    db: Service.ServiceData['db'],
    sql: Sequelize
}) {

    const router = Router();

    const folders = fs.readdirSync(serviceFolder);

    for (const folder of folders) {

        const files = fs.readdirSync(serviceFolder + '/' + folder);

        for (const file of files) {

            const service = require(serviceFolder + '/' + folder + '/' + file).default as Service.Params;

            const methodColor = (() => {
                switch (service.method) {
                    case 'all': 
                        return colors.cyan;
                    case 'get':
                        return colors.green;
                    case 'post':
                        return backgrounds.bgWhite + colors.magenta;
                    case 'delete':
                        return colors.red;
                    case 'patch':
                    case 'put':
                        return colors.yellow;
                }
            })();

            console.log(
                methodColor + 
                service.method.toUpperCase() +
                reset + '\t' +
                backgrounds.bgWhite +
                colors.blue +
                prefix + service.route +
                reset + '\t' +
                (service.isPublic
                    ? (colors.green + 'public')
                    : (colors.red + 'private'))
                + reset
            );

            router[service.method](prefix + service.route, async (req, res, next) => {

                const payload = req.method === 'GET' ? req.query : req.body;

                try {

                    const auth = {} as { userId: string; roles: string[] };

                    if (!service.isPublic) {

                        const { userId, roles } = await verifyToken({ db: data.db, req, SError: ServerError });
                        auth.userId = userId;
                        auth.roles = roles;
                    }

                    if (service.roles) {

                        let ok = false;

                        for (const r of service.roles) {

                            if (auth.roles.includes(r)) {

                                ok = true;
                            }
                        }

                        if (!ok) {

                            throw {
                                code: '101-02',
                                status: 401
                            };
                        }
                    }
        
                    const response = await service.callback({
                        ...data,
                        Op: Op,
                        headers: req.headers,
                        method: req.method,
                        userId: auth.userId || null,
                        // @ts-ignore
                        ip: req.clientIp,
                        param1: req.params.param1,
                        param2: req.params.param2,
                        payload: payload,
                        ext: {
                            Open5e: Open5e
                        },
                        SError: ServerError
                    });
                    
                    if (!response) {

                        res.status(service.status || 200).end();
                        return;
                    }

                    res.status(service.status || 200)
                        .send(response)
                        .end();

                    if (process.env.LOG_RESPONSES) {

                        if (typeof response === 'object' && response !== null) {

                            for (const k in response) {

                                if (['token'].includes(k)) {

                                    response[k] = '(´・∀・｀)ﾍｰ';
                                }
                            }

                            console.log(
                                `${actions.dim}response${reset} ` +
                                    JSON.stringify(response, null, 2)
                            );
                        }
                        else {
                            console.log(
                                `${actions.dim}response${reset}\t_` +
                                    typeof response
                            )
                        }
                    }
                }
                catch (err) {

                    const fallbackMsg = (() => {
                        
                        switch (err.status) {
                            case 400: return 'bad request';
                            case 401: return 'authentication error';
                            case 403: return 'unauthorized';
                            case 404: return 'not found';
                            default: return 'unhandled exception';
                        }
                    })();

                    if (!err.status || err.status >= 500) {

                        console.log(err.stack);
                    }

                    res.status(err.status || 500).json({
                        code: err.code || '101-01',
                        message: err.message || fallbackMsg || null
                    }).end();
                }
                // finally {

                //     next();
                // }
            });
        }
    }

    return router;
}