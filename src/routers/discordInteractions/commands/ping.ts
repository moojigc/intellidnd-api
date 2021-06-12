import { Data, InteractionPayload } from '../types';

export default function ping(
    input: string | null,
    data: Data
) {
    return `Pong! IntelliDnD-Slash is still alive!`;
};
