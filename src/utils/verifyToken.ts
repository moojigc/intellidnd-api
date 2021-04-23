import type ServerError from './Error';
import type { Request } from 'express';
import type { Service } from '../types';
import jwt from 'jsonwebtoken';

export default async function ({
    db,
    req,
    SError,
}: {
    db: Service.ServiceData['db'];
    req: Request;
    SError: typeof ServerError;
}) {

    const token = req.headers.authorization || req.query.token as string;
    let decoded: { id: string; userId: string };

    if (!token) {
        
        throw new SError('auth-01', 401);
    }
    else if (!/^Bearer /.test(token)) {

        throw new SError('auth-02', 400, 'Authorization header should be formatted as `Bearer [token]`');
    }

    try {

        decoded = jwt.verify(
            req.headers['authorization'].replace('Bearer ', ''),
            process.env.TOKEN_SECRET
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

    return { userId: lookup.userId, roles: lookup.roles };
}
