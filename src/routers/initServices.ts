import type { Sequelize } from 'sequelize/types';
import type Redis from 'redis';
import type { ServiceData } from '../types';
import type { Service } from '@utils/Service';

import Twilio from 'twilio';
import fs from 'fs';
import { Op } from 'sequelize';
import { Router } from 'express';

import verifyToken from '@utils/verifyToken';
import Open5e from '../externalServices/Open5e';
import { actions, backgrounds, colors, reset } from '@utils/print';
import ServerError from '@utils/Error';
import validate from '@utils/validate';
import limiter from '@utils/rateLimiter';
import DiscordOAuth from 'externalServices/DiscordOAuth';

const serviceFolder = __dirname.replace('routers', 'services');

export default function(data: {
    db: ServiceData['db'],
    sql: Sequelize;
    redis: Redis.RedisClient;
    env: NodeJS.ProcessEnv;
}) {

    console.log(data.env)
    
    const prefix = '/' + (process.env.VERSION_PREFIX || 'v1');
    const twilio = Twilio(data.env.TWILIO_SID, data.env.TWILIO_TOKEN);
    const router = Router();

    const folders = fs.readdirSync(serviceFolder);

    for (const folder of folders) {

        const files = fs.readdirSync(serviceFolder + '/' + folder);
        
        for (const file of files) {

            if (file[0] === '_') continue;
    
            if (!/.js|.ts/.test(file)) {

                files.push(...fs.readdirSync(serviceFolder + '/' + folder + '/' + file).map(r => file + '/' + r));
                continue;
            }

            const service = require(serviceFolder + '/' + folder + '/' + file).default as Service<any, any>;

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

            const customMiddleware = service.middleware || [];

            router[service.method](prefix + service.route,
                verifyToken({ db: data.db, err: ServerError, service }),
                limiter(data.redis, service),
                ...customMiddleware,
                async (req, res, next) => {

                const payload = (req.method === 'GET' ? req.query : req.body) || {};

                delete req.query.token;

                try {

                    validate(service.payload, payload);
        
                    const response = await service.callback({
                        ...data,
                        Op: Op,
                        headers: req.headers,
                        cookies: {
                            ...req.cookies,
                            ...req.signedCookies
                        },
                        method: req.method,
                        user: req.user || null,
                        ip: req.clientIp!,
                        param1: req.params.param1 || '',
                        param2: req.params.param2 || '',
                        payload: payload,
                        ext: {
                            twilio: twilio,
                            Open5e: Open5e,
                            DiscordOAuth: DiscordOAuth
                        },
                        env: process.env,
                        err: ServerError
                    });

                    const status = response ? 200 : 204;

                    if (service.setInHeader) {

                        if (service.setInHeader.cookie) {

                            const value = typeof service.setInHeader.cookie === 'string'
                                ? service.setInHeader.cookie
                                : service.setInHeader.cookie.value;

                            const defAge = Date.now () + 1000 * 60 * 60;
                            const maxAge = new Date(
                                    (typeof service.setInHeader.cookie === 'string'
                                        ? defAge
                                        : (service.setInHeader.cookie.maxAge || defAge))
                            );

                            res.cookie('refresh', value, {
                                expires: maxAge,
                                httpOnly: true,
                                sameSite: 'lax',
                                secure: data.env.NODE_ENV === 'PRODUCTION'
                            });
                        }
                    }
                    
                    res.status(status);

                    if (response) { res.send(response); }

                    res.end();

                    if (data.env.LOG_RESPONSES) {

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

                    if (!err.status || err.status >= 500) {

                        console.log(err);
                    }

                    res.status(err.status || 500).json({
                        code: err.code || 'service-01',
                        message: err.message || null
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