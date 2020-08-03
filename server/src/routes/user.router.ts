import passport from 'passport';
import { Player, User } from '../models';
import { Types } from 'mongoose';
import { isEqual } from 'lodash';
import { Router } from 'express';
import { serverError, isAuth, flash, RequestWithUser } from '../config/middleware';
const { ObjectId } = Types;

export default function (router: Router) {
	router.post('/api/register', async (req, res) => {
		let { email, username, password, password2, token, characterName } = req.body;
		let playerData = await Player.findOne({ token: token, name: characterName });

		if (!playerData) {
			flash('error', 'Token or player name does not match. Please double check.');
			res.redirect('/register');
			// Player registered to another user
		} else if (playerData.webUserId) {
			flash(
				'error',
				'Player is already registered. If you think this is incorrect, please reset your token.'
			);
			res.redirect('/register');
			// If any field is empty
		} else if (username === '' || password === '' || password2 === '') {
			flash('error', 'Please fill in all required fields.');
			res.redirect('/register');
			// Passwords match
		} else if (password === password2) {
			// Check for usernames
			let response = await User.findOne({ username: username });

			// If username taken
			if (response) {
				flash('error', 'Username already taken!');
				res.redirect('/register');
				// Username not taken
			} else {
				let user = new User({
					username: username,
					password: password,
					email: email,
					characters: [playerData._id]
				});
				await user.encryptPass();
				let userInsert = await User.create(user.toObject());
				console.log(userInsert);
				if (userInsert) {
					flash('success', `Welcome, player ${user.username}!`);
					res.redirect('/login');
				} else {
					flash('error', 'Could not register you. Please try again later.');
					res.redirect('/register');
				}
			}
		} else {
			flash('error', 'Passwords do not match.');
			res.redirect('/register');
		}
	});
	router.post(
		'/api/login',
		(req, res, next) => {
			if (req.body.rememberMe) {
				// 6 months
				req.session.cookie.originalMaxAge = 60000 * 60 * 24 * 7 * 26;
			} else {
				// 24 hours
				req.session.cookie.originalMaxAge = 60000 * 60 * 24;
			}
			next();
		},
		passport.authenticate('local', {
			successRedirect: '/inventory',
			failureRedirect: '/login',
			failureFlash: true
		})
	);
	router.get('/inventory', async (req: RequestWithUser, res) => {
		if (!req.user) {
			flash('error', 'Must log in to see inventory.');
			res.redirect('/login');
		} else {
			try {
				let { defaultPlayer } = await User.findOne({
					_id: ObjectId(req.user)
				}).populate('defaultPlayer');
				res.render('inventory', {
					player: defaultPlayer.toObject()
				});
			} catch (error) {
				console.trace(error);
				serverError(res);
			}
		}
	});
	router.get('/inventory/:id', async (req: RequestWithUser, res) => {
		if (!req.user) {
			flash('error', 'Must log in to see inventory.');
			res.redirect('/login');
		} else {
			try {
				let player = await Player.findOne({ _id: Object(req.params.id) });
				res.render('inventory', {
					player: player.toObject()
				});
			} catch (error) {
				console.trace(error);
				serverError(res);
			}
		}
	});
	router.put('/inventory', async (req, res, next) => {
		const putInventory = require('../config/middleware/putInventory');
		await putInventory(req, res, {
			Player: Player,
			isEqual: isEqual,
			ObjectId: ObjectId
		});
	});
	router.get('/logout', (req, res) => {
		req.logout();
		flash('success', 'You are logged out.');
		res.redirect('/login');
	});
	router.post('/api/add-character', async (req: RequestWithUser, res) => {
		try {
			if (!req.user) {
				flash('error', 'Please login to add new character.');
				res.redirect('/login');
			} else {
				let { token, characterName } = req.body;
				console.log(token, characterName);
				if (!token || !characterName) {
					flash('error', 'Both fields are required.');
					res.redirect('/add-character');
					return;
				}
				let playerData = await Player.findOne({ token: token, name: characterName });
				if (playerData) {
					let user = await User.findOne({ _id: ObjectId(req.user) }).populate(
						'players'
					);
					let characterCheck = user.players.filter(
						(p) => playerData._id.toString() === p._id.toString()
					);

					if (characterCheck.length > 0) {
						flash(
							'error',
							`${req.body.characterName} has already been added to your character list.`
						);
						res.redirect('/add-character');
						return;
					}
					// Update player with new webUserId, update user with new player IDs
					let playerResponse = await Player.updateOne(
						{ _id: ObjectId(playerData._id) },
						{ webUserId: req.user }
					);
					let userResponse = await User.updateOne(
						{ _id: ObjectId(req.user) },
						{ $push: { players: playerData._id } }
					);

					if (userResponse.nModified === 1 && playerResponse.nModified === 1) {
						flash('success', `Added ${playerData.name} to your list of characters.`);
						res.redirect('/add-character');
					} else {
						flash(
							'error',
							`Unexpected error: Could not add ${playerData.name} to your list of characters.`
						);
						res.redirect('/add-character');
					}
				} else {
					flash(
						'error',
						"Sorry, either that character doesn't exist, or the token was incorrect."
					);
					res.redirect('/add-character');
				}
			}
		} catch (error) {
			console.log(error);
			serverError(res);
		}
	});
	router.post('/change-default-char', isAuth, async (req: RequestWithUser, res) => {
		const player = await Player.findOne({ _id: ObjectId(req.body.characterId) });
		const playerWebUserId = ObjectId(player.webUserId),
			userId = ObjectId(req.user);
		if (!playerWebUserId.equals(userId)) {
			flash('error', 'Something weird happened.');
			res.redirect('/all-characters');
			return;
		}
		const { nModified } = await User.updateOne(
			{ _id: ObjectId(req.user) },
			{ defaultPlayer: player._id }
		);
		if (nModified === 1) {
			flash('success', `${player.name} is now your default character.`);
			res.redirect('/all-characters');
		} else {
			flash('error', `${player.name} is already your default character.`);
			res.redirect('/all-characters');
		}
	});
	router.get('/all-characters', isAuth, async (req, res) => {
		// let user = await new User({ id: req.user }).dbRead();
		// console.log(user);
		let allCharacters = (await Player.find({ webUserId: req.user })).map((p) => p.toObject());
		res.render('all-characters', {
			characters: allCharacters
		});
	});
}
