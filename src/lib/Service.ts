
import type { ServiceData } from '@types';
import type { NextFunction, Request, Response } from 'express';
import serverError from '@utils/Error';
import Controller from './Controller';

type Method =  'GET' | 'PATCH' | 'POST' | 'DELETE' | 'ALL';
type MethodLowerCase = 'get' | 'patch' | 'post' | 'delete' | 'all';
type Context = {
	req: Request;
	res: Response;
	service: Service;
};
type Middleware = (req: Request, res: Response, next?: NextFunction) => void;
type Callback<T> = (data: ServiceData, context?: Context) => Promise<T> | T;
type PayloadType =
	| 'string'
	| 'number'
	| 'integer'
	| 'null'
	| 'email'
	| 'boolean'
	| 'phone';

interface ServiceCreateOptions<R = null, O = null> {
	controller?: Controller;
	roles?: Set<string>;
	method?: Method | MethodLowerCase;
	route?: string;
	isPublic?: boolean;
	payload?: {
		required?: Record<keyof R, PayloadType | PayloadType[]> | null;
		optional?: Record<keyof O, PayloadType | PayloadType[]> | null;
	};
	rateLimit?: {
		skipFailed?: boolean;
		skipSuccessful?: boolean;
		window?: number;
		message?: string;
		max?: number;
	};
	middleware?: Middleware[];
	callback: string | Callback<any>;
}

class ServiceError extends Error {
	constructor(
		public code: string = 'service-01',
		public status: 400 | 401 | 403 | 404 | 426 | 500 = 500,
		public message: string = 'Internal error',
	) {
		super();
		this.message = message;
		this.code = code;
		this.status = status;
	}
	get name() { return 'ServiceError'; };
}

export class Service<R = null, O = {}, Result = any> {

	public static basePath: string;

	public static ServiceError = ServiceError;

	constructor(
		options: ServiceCreateOptions<R, O>
	) {
		for (const k in options) {
			if (k === 'name') {
				this._name ||= options[k];
				continue;
			}
			this[k] = options[k];
		}

		this.roles ??= new Set();
		this.roles.add('user');

		if (options.controller) {
			this.init({ controller: options.controller });
		}
	};

	private _name: string = '';

	get name() {
		return this._name;
	}

	get documentation() {
		return {
			name: this.name,
			route: this.route,
			method: this.method,
			payload: this.payload,
			isPublic: this.isPublic
		};
	}

	// public params?: Set<'param1' | 'param2'>;
	public route: string = '';
	public controller: Controller;
	public method: Method = 'GET';
	public isPublic: boolean = false;
	public roles?: Set<string> = new Set(['user']);
	public middleware?: Middleware[];
	public payload: ServiceCreateOptions<R, O>['payload'] = {};
	public callback: string | Callback<Result>;
	public getCallbackFn() {
		if (typeof this.callback === 'string') {
			this.callback = require(this.callback).default as Callback<Result>;
		}
		return this.callback.bind(this.controller);
	}
    public rateLimit?: ServiceCreateOptions['rateLimit'];
	public error(code: string, status: 400 | 401 | 403 | 500, message?: string) {
		return new Service.ServiceError(
			code,
			status,
			message
		);
	}
	public init(options: { controller: Controller, name?: string }) {
		
		this.controller ??= options.controller;
		this._name ||= options.name || '';
		if (this.controller.base) {
			this.route = this.controller.base + this.route;
		}
		if (!('isPublic' in options)) {
			this.isPublic = this.controller.isPublic;
		}
	}
}
export default Service;
