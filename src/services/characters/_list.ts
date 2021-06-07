import { CharacterAttributes } from "../../models/Character";
import { ServiceData } from '@types';

export default async function list({
    db,
    user,
    payload
}: ServiceData<Partial<CharacterAttributes>>) {

    const common = {
        userId: user.id
    };

    const chars = await db.Character.lookupAll({
        ...Object.keys(payload).length
            ? {
                ...payload,
                ...common
            }
            : common
    });

    return chars;
}