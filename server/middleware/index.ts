import { Request, Response, NextFunction } from 'express';
import { IPlayer } from '../models';
declare global {
	interface RequestWithUser extends Request {
		user: string | number;
	}
}

type FlashProps =
	| [Response, 'error' | 'success', string, string?]
	| ['error' | 'success', string, string?];

export const flash = (...args: FlashProps) => {
	switch (typeof args[0] !== 'string') {
		case true:
			return (args[0] as Response).json({
				flash: {
					type: args[1],
					message: args[2],
				},
				redirect: args[3],
			});
		default:
			return {
				flash: {
					type: args[0],
					message: args[1],
				},
				redirect: args[2],
			};
	}
};

export function isAuth(
	req: Request | RequestWithUser,
	res: Response,
	next: NextFunction
): void {
	switch (req.isAuthenticated()) {
		case true:
			next();
			break;
		default:
		case false:
			// res.status(401).json(flash('error', 'Authentication error.')).end();
			flash(res, 'error', 'Authentication error.');
			return;
	}
}

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

export function serverError(res: Response, err: any) {
	console.error(err);
	res.status(500).json(flash('error', 'Internal server error.')).end();
}

export { default as passport } from './passport';

/**
 * Returns the character's inventory as an array of 4 objects, where `money` is also an array of objects
 */
export const mapInventory = (character: IPlayer) =>
	['potions', 'weapons', 'misc', 'money'].map((title) => {
		if (title !== 'money')
			return {
				[title]: character.inventory[title],
			};
		else
			return {
				money: ['copper', 'silver', 'gold', 'platinum', 'electrum'].map(
					(m) => ({
						[m]: character.inventory[m],
					})
				),
			};
	});
