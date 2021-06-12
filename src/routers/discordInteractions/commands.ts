import { InteractionResponseType } from 'discord-interactions';
import { Data, InteractionPayload, InteractionsServiceData } from './types';
import Embed from './utils.ts/Embed';

const commands = {
    d: {
        path: '/dice',
        trim: true,
        defaultArg: '1d20'
    },
    dice: {
        path: '/dice',
        trim: true,
        defaultArg: '1d20'
    },
    x: {
        path: '/dice',
        trim: true,
        multiArg: true,
        defaultArg: {
            dice: 1,
            sides: 20,
            modifier: 0,
            name: null
        }
    },
    ping: {
        path: '/ping',
        trim: false
    },
    hellothere: {
        path: '/hello',
        trim: false
    },
    help: {
        path: '/help',
        trim: false,
    },
    list: {
        path: '/list',
        trim: true
    }
} as Record<string, {
    path: string;
    trim: boolean;
    errorMsg?: string;
    match?: RegExp;
    type?: 4 | 5;
    defaultArg?: string | number | Record<string, any>;
    multiArg?: boolean;
}>;

export const execute = async (name: string, {
    db,
    sql,
    payload
}: InteractionsServiceData ) => {

    const command = commands[name];
    const options: Record<string, any> = {};

    let arg: string =
        payload.data.value ||
        (payload.data.options?.length === 1 && payload.data.options[0].value) ||
        (typeof command.defaultArg !== 'object' && command.defaultArg) ||
        null;

    if (command.multiArg) {

        for (const o of payload.data.options || []) {

            options[o.name] = o.value;
        }
    }

    if (command.trim && typeof arg === 'string') {

        arg = arg.trim();
    }

    if (command.match) {

        const ok = command.match.test(arg);

        if (!ok) {

            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: command.errorMsg
                }
            };
        }
    }

    const callback = (require('./commands' + command.path).default) as 
        (a: string, data: Data) => Promise<string | Embed>;

    const response = await callback(arg, {
        payload,
        db,
        mention: (s: string) => `<@!${s}>`,
        options: options,
        defaultArg: command.defaultArg
    });

    const data = response instanceof Embed
        ? { embeds: [response.toJSON()] }
        : { content: response };

    return {
        type: command.type || InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data
    };
}

export default commands;