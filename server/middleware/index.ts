import { Request, Response, NextFunction } from 'express';

// interface RequestWithUser extends Request {
// 	user: string | number;
// }

declare global {
	interface RequestWithUser extends Request {
		user: string | number;
	}
}

export const flash = (
	...args:
		| [Response, 'error' | 'success', string, string?]
		| ['error' | 'success', string, string?]
) => {
	switch (typeof args[0] !== 'string') {
		case true:
			return (args[0] as Response).json({
				flash: {
					type: args[1],
					message: args[2]
				},
				redirect: args[3]
			});
		default: 
			return {
				flash: {
					type: args[0],
					message: args[1]
				},
				redirect: args[2]
			}
	}
};

export function isAuth(req: Request, res: Response, next: NextFunction): void {
	switch (req.isAuthenticated()) {
		case true:
			next();
			break;
		default:
		case false:
			// res.status(401).json(flash('error', 'Authentication error.')).end();
			flash(res, 'error', 'Authentication error.')
			return;
	}
}

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

export function serverError(res: Response, err: any) {
	console.error(err);
	res.status(500).json(flash('error', 'Internal server error.')).end();
}

export { default as passport } from './passport';
