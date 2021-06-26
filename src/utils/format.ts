import type { NextFunction, Request, Response } from "express";

export function phone(p: string) {
    return p.split('')
        .filter(d => /\d/.test(d))
        .join('')
        .padStart(11, '1');
};
export const middleware = {
    phone: (key: 'param1' | 'phone') => {
        return (req: Request, res: Response, next: NextFunction) => {
            switch (key) {
                case 'param1':
                    req.params.param1 = phone(req.params.param1);
                    break;
                case 'phone':
                    if (req.body.phone) {
                        req.body.phone = phone(req.body.phone);
                    }
                    break;
            }
            next();
        }
    }
}