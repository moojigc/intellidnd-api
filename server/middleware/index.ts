import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

export interface RequestWithUser extends Request {
    user: string | number;
}

export const flash = (type: 'error' | 'success', message: string) => {
    return {
        flash: {
            message,
            type
        }
    };
};

export function isAuth(req: Request, res: Response, next: NextFunction): void {
    switch (!!req.user) {
        case true:
            next();
        default:
        case false:
            res.status(401)
                .json({
                    redirect: '/login',
                    ...flash('error', 'Authentication error.')
                })
                .end();
            break;
    }
}

export const crypt = async (pass: string): Promise<string> => {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(pass, 10, function (err, hash) {
            if (err) reject(err);
            resolve(hash);
        });
    });
};

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

export function serverError(res: Response) {
    res.status(500).json(flash('error', 'Internal server error.')).end();
}

export { default as passport } from "./passport";
