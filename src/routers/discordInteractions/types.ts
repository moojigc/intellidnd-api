import type { initModels } from '@models';
import type { ServiceData } from '@types';
import type { Sequelize } from 'sequelize/types';

enum ValueType {
    string = 3,
    number = 4,
}

export interface InteractionsServiceData {
    db: ServiceData['db'];
    sql: Sequelize;
    payload: InteractionPayload;
};

export interface InteractionPayload<T = any> {
    application_id: string;
    channel_id: string;
    data: {
        id: string;
        name: string;
        value?: T;
        options: Array<{
            name: string;
            type: ValueType.string;
            value: T;
        }>;
    };
    guild_id: string;
    id: string;
    member: {
        deaf: boolean;
        is_pending: boolean;
        joined_at: string;
        mute: boolean;
        nick: string;
        pending: boolean;
        permissions: string;
        premium_since: string;
        roles: string[];
        user: {
            avatar: string;
            discriminator: string;
            id: string;
            public_flags: number;
            username: string;
        };
    };
    token: string;
    type: number;
    version: number;
}

export interface Data {
    payload: InteractionPayload;
    db: ReturnType<typeof initModels>;
    mention: (id: string) => string;
    options: Record<string, any>;
    defaultArg: any
}
