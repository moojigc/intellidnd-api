import { CharacterAttributes } from "../../models/Character";
import { Service } from "../../types";

export default async function list({
    db,
    user,
    payload
}: Service.ServiceData<Partial<CharacterAttributes>>) {

    const common = {
        userId: user.id
    };

    const chars = await db.Character.findAll({
        where: Object.keys(payload).length
            ? {
                ...payload,
                ...common
            }
            : common
    });

    return chars;
}