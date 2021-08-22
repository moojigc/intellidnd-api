import type { ServiceData } from '@types';
import type Redis from 'redis';
import type { Twilio } from 'twilio';
import type { Sequelize } from 'sequelize/types';

import { Op } from 'sequelize';
import { Router } from 'express';
import Controller from '@lib/Controller';
import validate from '@utils/validate';
import Open5e from 'externalServices/Open5e';
import DiscordOAuth from 'externalServices/DiscordOAuth';

export default function(data: {
    twilio: Twilio;
    prefix: string;
    db: ServiceData['db'],
    sql: Sequelize;
    redis: Redis.RedisClient;
    env: NodeJS.ProcessEnv;
}) {
    return Controller.middleware(
        {
            path: __dirname.replace('routers', 'controllers'),
            router: Router(),
            prefix: data.env.VERSION_PREFIX || '/v1'
        },
        (service) => [
            async (req, res, next) => {
	
                const payload = (req.method === 'GET' ? req.query : req.body) || {};

                delete req.query.token;

                try {

                    validate(service, payload);
        
                    const response = await service.getCallbackFn()({
                        db: data.db,
                        sql: data.sql,
                        Op: Op,
                        user: req.user || null,
                        param1: req.params.param1 || '',
                        param2: req.params.param2 || '',
                        payload: payload,
                        ext: {
                        	twilio: data.twilio,
                        	Open5e: Open5e,
                        	DiscordOAuth: DiscordOAuth
                        },
                        env: process.env,
                        err: service.error
                    }, {
                        req,
                        res,
                        service
                    });

                    const status = response ? 200 : 204;

                    // if (service.headers) {

                    //     for (const header in service.headers) {
                    //         if (header === 'cookie') {
    
                    //             const value = typeof service.headers.cookie === 'string'
                    //                 ? service.headers.cookie
                    //                 : service.headers.cookie.value;
    
                    //             const defAge = Date.now () + 1000 * 60 * 60;
                    //             const maxAge = new Date(
                    //                     (typeof service.headers.cookie === 'string'
                    //                         ? defAge
                    //                         : (service.headers.cookie.maxAge || defAge))
                    //             );
    
                    //             res.cookie('refresh', value, {
                    //                 expires: maxAge,
                    //                 httpOnly: true,
                    //                 sameSite: 'lax',
                    //                 secure: data.env.NODE_ENV === 'PRODUCTION'
                    //             });
                    //         }
                    //         else {

                    //             res.setHeader(header, service.headers[header]);
                    //         }
                    //     }
                    // }
                    
                    res.status(status);

                    if (response) { res.send(response); }

                    res.end();

                    // if (data.env.LOG_RESPONSES) {

                    // 	if (typeof response === 'object' && response !== null) {

                    // 		for (const k in response) {

                    // 			if (['token'].includes(k)) {

                    // 				response[k] = '(´・∀・｀)ﾍｰ';
                    // 			}
                    // 		}

                    // 		console.log(
                    // 			`${actions.dim}response${reset} ` +
                    // 				JSON.stringify(response, null, 2)
                    // 		);
                    // 	}
                    // 	else {
                    // 		console.log(
                    // 			`${actions.dim}response${reset}\t_` +
                    // 				typeof response
                    // 		)
                    // 	}
                    // }
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
            }
        ]
    )
}