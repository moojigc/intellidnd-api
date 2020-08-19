/**
 * auto runs every route in each controller
 */

import { Router } from 'express';
import {
	isAuth as isPrivate
} from '../middleware';
import user from '../controllers/user'
import character from '../controllers/character'
const router = Router();

user.forEach(({ method, isAuth, callback, route }) => {
	console.log(`router.${method}("/user${route}")`)
	router[method](`/user${route}`, isAuth ? [isPrivate, callback] : callback);
});

character.forEach(({ method, isAuth, callback, route }) => {
	console.log(`router.${method}("/characters${route}")`)
	router[method](`/characters${route}`, isAuth ? [isPrivate, callback] : callback);
});

export default router;