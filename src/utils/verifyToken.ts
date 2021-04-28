import type ServerError from './Error';
import type { Request, Response, NextFunction } from 'express';
import type { Service } from '../types';
import jwt from 'jsonwebtoken';

export default function ({
    db,
    SError,
    service
}: {
    db: Service.ServiceData['db'];
    SError: typeof ServerError;
    service: Service.Params;
}) {

    return async (req: Request, res: Response, next: NextFunction) => {

        if (service.isPublic) {

            next();
            return;
        }

        const token = req.headers.authorization || req.query.token as string;
        let decoded: { id: string; userId: string };
        
        try {
            
            if (!token) {
                
                throw new SError('auth-01', 401, 'Authentication error');
            }
            else if (req.headers.authorization && !/^Bearer /.test(token)) {
        
                throw new SError('auth-02', 400, 'Authorization header should be formatted as `Bearer [token]`');
            }
        
            try {
        
                decoded = jwt.verify(
                    req.headers['authorization']!.replace('Bearer ', ''),
                    process.env.TOKEN_SECRET!
                ) as typeof decoded;
            }
            catch (error) {
        
                throw new SError('auth-03', 401, 'Invalid token');
            }
        
            const lookup = await db.Token.findOne({
                where: {
                    id: decoded.id
                }
            });

            if (!lookup) {
        
                throw new SError('auth-04', 401);
            }
            
            const tokenRolesMap = await lookup.getRolesMap();
            
            if (service.roles) {
                
                for (const r of service.roles) {
                    
                    if (!(r in tokenRolesMap)) {

                        throw new SError('auth-06', 401);
                    }
                }
            }
            
            const user = await db.User.lookup(lookup.userId);

            if (!user) {

                throw new SError('auth-07', 401);
            }
            
            req.user = user;
            req.roles = await req.user.getRolesMap();
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
