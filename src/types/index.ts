import { initModels } from '../models';
import type { Request } from 'express';
import type Open5e from '../externalServices/Open5e';
import type { Sequelize, Op } from 'sequelize/types';
import ServerError from '../utils/Error';

export namespace Service {
    export abstract class Params {
        route: string;
        callback: (data: ServiceData) => any;
        roles?: string[];
        status?: number;
        payload?: {
            required: Record<string, string | string[]>;
            optional: Record<string, string | string[]> | 'any';
        }
        method: 'get' | 'post' | 'delete' | 'put' | 'patch' | 'all';
        isPublic: boolean;
    };
    export interface ServiceData<T = any> {
        headers: Request['headers'];
        ip: string;
        Op: typeof Op;
        method: Request['method'];
        sql: Sequelize;
        userId?: string;
        param1?: string;
        param2?: string;
        payload: T;
        db: ReturnType<typeof initModels>;
        ext: {
            Open5e: typeof Open5e
        };
        SError: typeof ServerError; 
    }
};
