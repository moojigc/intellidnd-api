import { flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player } from '../../models';

const getAllCharacters = async (req: RequestWithUser, res: Response) => {
    try {
        let allCharacters = (await Player.find({ webUserId: req.user })).map((p) =>
            p.toObject()
        );
        res.json({
            ...flash('success', `${allCharacters.length} character(s) found.`),
            characters: allCharacters
        });
    } catch (error) {
        serverError(res, error)
    }
}

export default {
    route: '/all',
    method: 'get',
    isAuth: true,
    callback: getAllCharacters
}