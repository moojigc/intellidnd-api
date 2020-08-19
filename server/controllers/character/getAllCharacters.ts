import { RequestWithUser, flash, serverError } from '../../middleware';
import { Response } from 'express';
import { Player, User } from '../../models';
import { Types } from 'mongoose';
const { ObjectId } = Types;

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
    route: '/',
    method: 'get',
    isAuth: true,
    callback: getAllCharacters
}