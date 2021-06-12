import { Data, InteractionPayload } from '../types';
import Embed from '../utils.ts/Embed';
import { DateTime } from 'luxon';

export default async function list(input: string | null, data: Data) {

    const {
        db,
        payload: { member, guild_id },
    } = data;

    const rolls = await db.Roll.getAllByDiscordUserId(member.user.id, guild_id, input);

    const [offset] = member.joined_at
        .substring(member.joined_at.length - 5)
        .split(':');

    const getDate = (ts: number) => {

        const iso = new Date(ts).toISOString();
        const date = DateTime.fromISO(iso.substring(0, iso.length - 4) + offset, {
            setZone: true,
        });

        return date.toFormat('LLL d, y');
    }

    return new Embed({
        title: `${member.nick || member.user.username}'s saved rolls`,
        fields: rolls.map((r) => ({
            name: r.name,
            value:
                '`' +
                r.input +
                '`' +
                `\n*last used ${getDate(r.lastRolledAt)}*`,
        })),
    }).setColor('BLURPLE');
}
