import type { Request } from 'express';
import type { Sequelize, Op } from 'sequelize/types';

import type Open5e from '../externalServices/Open5e';
import type ServerError from '../utils/Error';
import type { initModels } from '../models';
import type { User } from '../models/User';
import type { Twilio } from 'twilio';

type PayloadType = 'string' | 'number' | 'integer' | 'null' | 'email' | 'boolean';
export namespace Service {
    export interface Params {
        route: string;
        callback: (data: ServiceData) => any;
        roles?: string[];
        status?: number;
        rateLimit?: {
            skipFailed?: boolean;
            skipSuccessful?: boolean;
            window?: number;
            message?: string;
            max?: number;
        };
        payload: {
            required: Record<string, PayloadType | PayloadType[]> | null;
            optional: Record<string, PayloadType | PayloadType[]> | null;
        }
        method: 'get' | 'post' | 'delete' | 'put' | 'patch' | 'all';
        isPublic: boolean;
    }
    export interface ServiceData<T = any> {
        headers: Request['headers'];
        ip: string;
        Op: typeof Op;
        method: Request['method'];
        sql: Sequelize;
        user: User;
        param1: string;
        param2: string;
        payload: T;
        db: ReturnType<typeof initModels>;
        ext: {
            twilio: Twilio;
            Open5e: typeof Open5e
        };
        SError: typeof ServerError; 
    }
}