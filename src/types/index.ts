import type { Request } from 'express';
import type { Sequelize, Op } from 'sequelize/types';

import type Open5e from '../externalServices/Open5e';
import type ServerError from '../utils/Error';
import type { initModels } from '../models';
import type { User } from '../models/User';
import type { Twilio } from 'twilio';

export interface ServiceData<T = any, U = User> {
    headers: Request['headers'];
    ip: string;
    Op: typeof Op;
    method: Request['method'];
    cookies: any;
    sql: Sequelize;
    user: U;
    param1: string;
    param2: string;
    payload: T;
    db: ReturnType<typeof initModels>;
    ext: {
        twilio: Twilio;
        Open5e: typeof Open5e
    };
    err: typeof ServerError; 
}