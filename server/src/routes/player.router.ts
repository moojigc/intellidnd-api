import { Player, User } from '../models';
import { Types } from 'mongoose';
import { isEqual } from 'lodash';
import { Router } from 'express';
import { serverError, isAuth, flash, RequestWithUser } from '../config/middleware';
const { ObjectId } = Types;

export default function (router: Router) {
    router.get("/api/")
}