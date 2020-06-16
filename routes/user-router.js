const { Player, User } = require("../models"),
	{ ObjectId } = require("mongoose").Types,
	passport = require("passport"),
	{ isEqual } = require("lodash"),
	isAuth = require("../config/middleware/isAuth"),
	userStatus = (req) => {
		return {
			loggedOut: req.user ? false : true,
			loggedIn: req.user ? true : false
		};
	},
	serverError = (res) => res.status(500).redirect("/server-error");
/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	app.post("/api/register", async (req, res) => {
		let { email, username, password, password2, token, characterName } = req.body;
		console.log(req.body);
		let playerData = await Player.findOne({ token: token, name: characterName });

		if (!playerData) {
			req.flash("errorMsg", "Token or player name does not match. Please double check.");
			res.redirect("/register");
			// Player registered to another user
		} else if (playerData.webUserId) {
			req.flash(
				"errorMsg",
				"Player is already registered. If you think this is incorrect, please reset your token."
			);
			res.redirect("/register");
			// If any field is empty
		} else if (username === "" || password === "" || password2 === "") {
			req.flash("errorMsg", "Please fill in all required fields.");
			res.redirect("/register");
			// Passwords match
		} else if (password === password2) {
			// Check for usernames
			let response = await User.findOne({ username: username });

			// If username taken
			if (response) {
				req.flash("errorMsg", "Username already taken!");
				res.redirect("/register");
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
					req.flash("successMsg", `Welcome, player ${user.username}!`);
					res.redirect("/login");
				} else {
					req.flash("errorMsg", "Could not register you. Please try again later.");
					res.redirect("/register");
				}
			}
		} else {
			req.flash("errorMsg", "Passwords do not match.");
			res.redirect("/register");
		}
	});
	// Login handle
	app.post(
		"/api/login",
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
		passport.authenticate("local", {
			successRedirect: "/inventory",
			failureRedirect: "/login",
			failureFlash: true
		})
	);
	app.get("/inventory", async (req, res) => {
		if (!req.user) {
			req.flash("errorMsg", "Must log in to see inventory.");
			res.redirect("/login");
		} else {
			try {
				let { defaultPlayer } = await User.findOne({ _id: ObjectId(req.user) }).populate(
					"defaultPlayer"
				);
				res.render("inventory", {
					player: defaultPlayer.toObject(),
					userStatus: userStatus(req)
				});
			} catch (error) {
				console.trace(error);
				serverError(res);
			}
		}
	});
	app.get("/inventory/:id", async (req, res) => {
		if (!req.user) {
			req.flash("errorMsg", "Must log in to see inventory.");
			res.redirect("/login");
		} else {
			try {
				let player = await Player.findOne({ _id: Object(req.params.id) });
				res.render("inventory", {
					player: player.toObject(),
					userStatus: userStatus(req)
				});
			} catch (error) {
				console.trace(error);
				serverError(res);
			}
		}
	});
	// Update route. Also used for deleting of single items bc it uses the same logic
	app.put("/inventory", async (req, res, next) => {
		const putInventory = require("../config/middleware/putInventory");
		await putInventory(req, res, {
			Player: Player,
			isEqual: isEqual,
			ObjectId: ObjectId
		});
	});
	app.get("/logout", (req, res) => {
		req.logout();
		req.flash("successMsg", "You are logged out.");
		res.redirect("/login");
	});
	app.post("/api/add-character", async (req, res) => {
		try {
			if (!req.user) {
				req.flash("errorMsg", "Please login to add new character.");
				res.redirect("/login");
			} else {
				let { token, characterName } = req.body;
				console.log(token, characterName);
				if (!token || !characterName) {
					req.flash("errorMsg", "Both fields are required.");
					res.redirect("/add-character");
					return;
				}
				let playerData = await Player.findOne({ token: token, name: characterName });
				if (playerData) {
					let user = await User.findOne({ _id: ObjectId(req.user) }).populate("players");
					let characterCheck = user.players.filter(
						(p) => playerData._id.toString() === p._id.toString()
					);

					if (characterCheck.length > 0) {
						req.flash(
							"errorMsg",
							`${req.body.characterName} has already been added to your character list.`
						);
						res.redirect("/add-character");
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
						req.flash(
							"successMsg",
							`Added ${playerData.name} to your list of characters.`
						);
						res.redirect("/add-character");
					} else {
						req.flash(
							"errorMsg",
							`Unexpected error: Could not add ${playerData.name} to your list of characters.`
						);
						res.redirect("/add-character");
					}
				} else {
					req.flash(
						"errorMsg",
						"Sorry, either that character doesn't exist, or the token was incorrect."
					);
					res.redirect("/add-character");
				}
			}
		} catch (error) {
			console.log(error);
			serverError(res);
		}
	});
	app.post("/change-default-char", isAuth, async (req, res) => {
		const player = await Player.findOne({ _id: ObjectId(req.body.characterId) });
		const playerWebUserId = ObjectId(player.webUserId),
			userId = ObjectId(req.user);
		if (!playerWebUserId.equals(userId)) {
			req.flash("errorMsg", "Something weird happened.");
			res.redirect("/all-characters");
			return;
		}
		const { nModified } = await User.updateOne(
			{ _id: ObjectId(req.user) },
			{ defaultPlayer: player._id }
		);
		if (nModified === 1) {
			req.flash("successMsg", `${player.name} is now your default character.`);
			res.redirect("/all-characters");
		} else {
			req.flash("errorMsg", `${player.name} is already your default character.`);
			res.redirect("/all-characters");
		}
	});
	app.get("/all-characters", isAuth, async (req, res) => {
		// let user = await new User({ id: req.user }).dbRead();
		// console.log(user);
		let allCharacters = (await Player.find({ webUserId: req.user })).map((p) => p.toObject());
		res.render("all-characters", {
			characters: allCharacters,
			userStatus: userStatus(req)
		});
	});
};
