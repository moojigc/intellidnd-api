import type { Request } from 'express';
import type { Sequelize, Op } from 'sequelize/types';

import type Open5e from '../externalServices/Open5e';
import type { initModels } from '../models';
import type { User } from '../models/User';
import type { Twilio } from 'twilio';
import type DiscordOAuth from 'externalServices/DiscordOAuth';
import Service from '@lib/Service';

export interface ServiceData<T = any, U = User> {
    Op: typeof Op;
    sql: Sequelize;
    user: U;
    param1: string;
    param2: string;
    payload: T;
    db: ReturnType<typeof initModels>;
    ext: {
        twilio: Twilio;
        Open5e: typeof Open5e;
        DiscordOAuth: typeof DiscordOAuth;
    };
    env: NodeJS.ProcessEnv;
    err: Service['error'];
}