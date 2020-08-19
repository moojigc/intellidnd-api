import { Request, Response, NextFunction } from 'express';

export interface RequestWithUser extends Request {
	user: string | number;
}

export const flash = (
	type: 'error' | 'success',
	message: string,
	redirect?: string
) => {
	return {
		flash: {
			message,
			type,
		},
		redirect: redirect,
	};
};

export function isAuth(req: Request, res: Response, next: NextFunction): void {
	switch (!!req.user || req.user) {
		case true:
			next();
		default:
		case false:
			res.status(401).json(flash('error', 'Authentication error.')).end();
			return;
	}
}

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

export function serverError(res: Response, err: any) {
	console.error(err);
	res.status(500).json(flash('error', 'Internal server error.')).end();
}

export { default as passport } from './passport';
