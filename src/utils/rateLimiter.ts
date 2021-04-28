import type Redis from 'redis';

import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Service } from '../types';

export default function limiter(redisClient: Redis.RedisClient, service: Service.Params) {

    if (!service.rateLimit) return async (req, res, next) => await next(); 

    return RateLimit({
        store: new RedisStore({
            client: redisClient,
        }),
        headers: true,
        keyGenerator: (req) => {

            if (req.user) {
                return req.user.id;
            }
            else {
                return req.clientIp!;
            }
        },
        skipFailedRequests: service.rateLimit.skipFailed ?? true,
    });
}