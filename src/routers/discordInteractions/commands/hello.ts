import { Data, InteractionPayload } from '../types';

export default function hello(
    input: string | null,
    data: Data
) {
    return `General <@!${data.payload.member.user.id}>!`;
}
