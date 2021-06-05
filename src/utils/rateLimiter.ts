import type Redis from 'redis';

import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Service } from '@utils/Service';

export default function limiter(redisClient: Redis.RedisClient, service: Service) {

    if (!service.rateLimit) return (req, res, next) => next(); 

    return RateLimit({
        store: new RedisStore({
            client: redisClient,
            expiry: service.rateLimit.window || 600000
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
        handler: (_req, res) => {

            res.status(429).json({
                code: 'limit-01',
                message: 'Too many requests, please try again later.'
            }).end();
        },
        max: service.rateLimit.max || 5,
        windowMs: service.rateLimit.window || 600000
    });
}