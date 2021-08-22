import type { NextFunction, Request, Response } from 'express';
import Service from '@lib/Service';
import { ServiceData } from '@types';
import { Router } from 'express';
import { Op } from 'sequelize';
import fs from 'fs';

type Middleware = (req: Request, res: Response, next?: NextFunction) => void;

export default class Controller {

	private static _recursivelyFindControllers(basePath: string) {

        const controllerPaths: string[] = [];
        const dir = fs.readdirSync(basePath);

        for (const name of dir) {

            if (name[0] === '_' || name === 'index') {
                continue;
            }

            const path = `${basePath}/${name}`;
            
            if (fs.lstatSync(path).isDirectory()) {
                controllerPaths.push(...this._recursivelyFindControllers(path));
            }
            else if (/controller.(js|ts)/.test(name)) {
                controllerPaths.push(path);
            }
        }
        return controllerPaths;
    }

    protected static _checkHttpMethod(methodName: string) {
        const methodMap = {
            ALL: /^all/i,
            GET: /^get/i,
        	POST: /^post/i,
            PATCH: /^patch/i,
            DELETE: /^delete/i
        };
        let ret: string | null = null;
        for (const method in methodMap) {
            if (methodMap[method].test(methodName)) {
                ret = method;
                break;
            }
        }
        return ret;
    }

    protected static _isServiceDecoratorReturn(prop: any) {
		if (
			typeof prop === 'object' &&
			'$$makeService' in prop &&
			prop['$$makeService'] === true &&
			'options' in prop &&
			'original' in prop &&
			typeof prop.original === 'function'
		) {
			return true;
		}
		return false;
	}

	private static _makeServiceDecoratorReturn(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller'>
	) {

		return function(
			_controller: Controller, _methodName: string, properties: { value?: Service['callback'] }
		) {
			if (!properties.value) {
				throw new Error('Missing value');
			}
	
			const fn = properties.value;
			properties.value = {
				// @ts-ignore
				$$makeService: true,
				options: options,
				// @ts-ignore
				original: fn,
			};
		}
	}

	/**
	 * Where the magic happens
	 */
    public static middleware(
		{
			path,
			router,
			prefix
		}: {
			path: string,
			router: Router,
			prefix: string,
		},
		requestHandler: (service: Service) => Middleware[]
    ) {

		const controllerPaths = new Set(this._recursivelyFindControllers(path));
		const controllers: Controller[] = [];

        for (const path of controllerPaths) {
            const exported = require(path);
            for (const name in exported) {
                if (
					exported[name].prototype instanceof this
				) {
                    controllers.push(
						new exported[name]() as Controller
					);
                }
            }
        }
	
		for (const controller of controllers) {

			for (const name of controller.ownServices) {
				controller[name].init({ controller, name });
			}
			// iterators are black magic, I swear
			for (const service of controller) {

				this.services[service.route] ??= {};

				if (
					service.route in this.services &&
					Object.keys(this.services[service.route]).length === 4
				) {
					throw new Error(`All HTTP methods already defined for route ${service.route}.`);
				}
				else if (service.method in this.services[service.route]) {
					throw new Error(`${service.method} ${service.route} found twice.`);
				}
				else if ('ALL' in this.services[service.route]) {
					throw new Error(`ALL ${service.method} conflicts with ${service.method} ${service.route}`)
				}

				this.services[service.route][service.method] = service.documentation;

				const middleware = controller.sharedMiddleware || [];
				middleware.push(...service.middleware || []);

				router[service.method.toLowerCase()](
					(prefix || '') + service.route,
					...middleware,
					...requestHandler(service)
				);
			}
		}

		// console.log(`--controllers--`);
		// console.log(controllers);
		console.log(`--services--`)
		console.log(this.services);

		return router;
	}

    public static MakeService(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller'>
	) {
		return this._makeServiceDecoratorReturn(options);
	}

	public static Get(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller' | 'method'>
	) {
		return this._makeServiceDecoratorReturn({
			...options || {},
			method: 'GET'
		});
	}
	
	public static Post(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller' | 'method'>
	) {
		return this._makeServiceDecoratorReturn({
			...options || {},
			method: 'POST'
		});
	}

	public static Patch(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller' | 'method'>
	) {
		return this._makeServiceDecoratorReturn({
			...options || {},
			method: 'PATCH'
		});
	}

	public static Delete(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller' | 'method'>
	) {
		return this._makeServiceDecoratorReturn({
			...options || {},
			method: 'DELETE'
		});
	}
	
	public static All(
		options?: Omit<ConstructorParameters<typeof Service>[0], 'callback' | 'controller' | 'method'>
	) {
		return this._makeServiceDecoratorReturn({
			...options || {},
			method: 'ALL'
		});
	}

    public static Service = Service;
	public static services: Record<string, Record<string, Service['documentation']>> = {};

    /**
     * not a real property, only for typing
    */
    public static ServiceData: ServiceData;

	constructor() {
		for (const name of this.ownServiceDecorators) {
			this[`$$${name}`] = new Service({
				...this[name].options || {},
				method: this[name].options?.method || Controller._checkHttpMethod(name) || 'GET',
				callback: this[name].original,
				controller: this,
				name: name
			});
		}
		for (const name of this.ownServices) {
			console.log(name)
			this[name].init({ controller: this, name: name.replace(/\$/g, '') });
		}
	}

	get ownServices() {
		const allOwnProps = new Set(Object.getOwnPropertyNames(this));
		for (const prop of allOwnProps) {
			if (
				!(this[prop] instanceof Service)
			) {
				allOwnProps.delete(prop);
			}
		}
		return [...allOwnProps];
	}

	get ownServiceDecorators() {
		const proto = Object.getPrototypeOf(this);
		const allOwnProps = new Set(Object.getOwnPropertyNames(proto));
		for (const prop of allOwnProps) {
			if (
				!Controller._isServiceDecoratorReturn(proto[prop])
			) {
				allOwnProps.delete(prop);
			}
		}
		return [...allOwnProps];
	}

	get length() {
		return this.ownServices.length;
	}
	
	get [Symbol.toStringTag]() {
		return 'Controller';
	}

	/**
	 * controller.prototype[Symbol.iterator] iterates over all own prototype methods that are instanceof service
	 */
	[Symbol.iterator](): {
		next: () => {
			done: boolean;
			value: Service
		}
	} {
        let i = 0;
        return {
			// @ts-ignore
            next: () => {
                if (i < this.length) {
                    const value = this[this.ownServices[i]];
                    i++;
                    return {
                        value: value,
                        done: false
                    }
                }
                else {
                    return {
                        done: true
                    }
                }
            }
        }
    }

	public base: string;
	// public sharedParams?: Record<string, PayloadType>
	public sharedMiddleware?: ((
		req: Request,
		res: Response,
		next?: NextFunction
	) => any)[] = [];
	public isPublic: boolean = true;
}
