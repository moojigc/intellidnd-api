import type { User } from '@models/User';
import type { ServiceData } from '@types';
import type { NextFunction, Request, Response } from 'express';

type PayloadType =
	| 'string'
	| 'number'
	| 'integer'
	| 'null'
	| 'email'
	| 'boolean'
	| 'phone';

export class Service<R = null, O = {}, P = boolean> {
	public route: string;
	public method: 'get' | 'post' | 'delete' | 'patch' | 'all';
	public isPublic: P;
	public roles: string[];
	public middleware?: Array<(req: Request, res: Response, next: NextFunction) => any>;
	public payload: {
		required?: Record<keyof R, PayloadType | PayloadType[]> | null;
		optional?: Record<keyof O, PayloadType | PayloadType[]> | null;
	};
	public callback: (data: ServiceData<R & Partial<O>, User>) => any;
	public rateLimit?: {
		skipFailed?: boolean;
		skipSuccessful?: boolean;
		window?: number;
		message?: string;
		max?: number;
	};
	public setInHeader?: {
		cookie?: string | {
			value: string;
			maxAge: number | null;
		}
	}

	constructor(options: Omit<Service<R, O>, 'roles'> & Partial<Pick<Service, 'roles'>>) {

		for (const k in options) {
			this[k] = options[k];
		}

		this.roles ??= ['user'];
	}
}
export default Service;
