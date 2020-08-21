/**
 * auto runs every route in each controller
 */

// import a from '../controllers/character/addCharacter';
// import b from '../controllers/character/changeDefaultCharacter';
// import c from '../controllers/user/login';
// import d from '../controllers/user/logout';
// import e from '../controllers/user/signup';
// import f from '../controllers/user/getStatus';
// import g from '../controllers/character/getAllCharacters';
// import h from '../controllers/character/getCharacter';
// import i from '../controllers/character/getInventory';
// import j from '../controllers/character/putInventory';
import { Router } from 'express';
import { isAuth as isPrivate } from '../middleware';
import user from '../controllers/user'
import character from '../controllers/character'
// const user = [a, b, c, d, e, f];
// const character = [g, h, i, j];
const prefix = 'api/v1'

// const loop = (router: Router, controller: any[], otherPrefix: string) => {
// 	for (let i=0; i<controller.length; i++) {
// 		const { callback, method, isAuth, route } = controller[i]
// 		router[method](`/${prefix}/${otherPrefix}${route}`, isAuth ? [isPrivate, callback] : callback)
// 	}
// }

// export const userRouter = (router: Router) => loop(router, user, 'user');
// export const characterRouter = (router: Router) => loop(router, character, 'characters');

export const userRouter = (router: Router) => user.forEach(({ method, isAuth, callback, route }) => {
	console.log(`router.${method}("/${prefix}/user${route}")`);
	router[method](`/${prefix}/user${route}`, isAuth ? [isPrivate, callback] : callback);
});

export const characterRouter = (router: Router) => character.forEach(({ method, isAuth, callback, route }) => {
	console.log(`router.${method}("/${prefix}/characters${route}")`);
	router[method](
		`/${prefix}/characters${route}`,
		isAuth ? [isPrivate, callback] : callback
	);
});
