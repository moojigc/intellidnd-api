import type ServerError from './Error';
import type { Request, Response, NextFunction } from 'express';
import type { Service } from '@utils/Service';
import type { ServiceData } from '@types';
import jwt from 'jsonwebtoken';

export default function ({
    db,
    err,
    service
}: {
    db: ServiceData['db'];
    err: typeof ServerError;
    service: Service;
}) {

    return async (req: Request, res: Response, next: NextFunction) => {

        if (service.isPublic) {

            next();
            return;
        }

        const token = req.headers.authorization || req.query.token as string;
        let decoded: { userId: string; roles?: string; };
        
        try {
            
            if (!token) {
                
                throw err('auth-01', 401, 'Authentication error');
            }
            else if (req.headers.authorization && !/^Bearer /.test(token)) {
        
                throw err('auth-02', 400, 'Authorization header should be formatted as `Bearer [token]`');
            }
        
            try {
        
                decoded = jwt.verify(
                    req.headers['authorization']!.replace('Bearer ', ''),
                    process.env.TOKEN_SECRET!
                ) as typeof decoded;
            }
            catch (error) {
        
                throw err('auth-03', 401, 'Invalid token');
            }
        
            const user = await db.User.lookup(decoded.userId);

            if (!user) {

                throw err('auth-07', 401);
            }
            
            req.user = user;
            req.roles = {};

            if (user.email?.verifiedAt || user.phone?.verifiedAt) {

                req.roles['user'] = true;
            }

            if (decoded.roles) {

                decoded.roles.split(',').forEach(r => req.roles[r] = true);
            }

            let permitted = false;
            
            for (const r of service.roles) {

                if (r in req.roles) {

                    permitted = true;
                }
            }

            if (!permitted) {

                throw err('auth-08', 403);
            }

            next();
        }
        catch (e) {

            res.status(e.status || 500).send({
                code: e.code || 'auth-05',
                message: e.message || 'Authentication error'
            }).end();
        }
    }
}
