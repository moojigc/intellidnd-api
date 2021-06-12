import { Data, InteractionPayload } from '../types';
import Embed from '../utils.ts/Embed';
import available from '../setup.json';

export default function hello(
    input: string | null,
    data: Data
) {

    return new Embed({
        title: 'Available Commands',
        fields: available.map(a => ({
            name: a.name,
            value: a.description
        }))
    }).setColor('BLURPLE');
}
