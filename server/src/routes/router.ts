import { Guild, Player } from "../models"
import { serverError, flash, RequestWithUser } from '../config/middleware'

module.exports = (app) => {
	app.get("/demo", async (req: RequestWithUser, res) => {
		try {
			let player = await (await Player.findOne({ discordId: "123" })).toObject();
			res.render("inventory", { player: player, userStatus: userStatus(req) });
		} catch (error) {
			serverError(res);
		}
	});
	// Renders the bot Guide
	app.get("/", async (req, res) => {
		try {
			res.render("guide", { userStatus: userStatus(req) });
		} catch (error) {
			serverError(res);
		}
	});

	// Returns player data in JSON format
	app.get("/api/guilds", async (req, res) => {
		try {
			let player = await Guild.find({}).populate("players");
			console.log(player);
			res.status(200).json(player).end();
		} catch (error) {
			serverError(res);
		}
	});

	app.get("/register", (req, res) => {
		res.render("register");
	});

	app.get("/login", (req, res) => {
		if (req.user) {
			res.redirect("/inventory");
		} else {
			res.render("login", { userStatus: userStatus(req) });
		}
	});
	app.get("/server-error", (req, res) => {
		res.render("server-error", { userStatus: userStatus(req) });
	});
	app.get("/add-character", (req, res) => {
		res.render("add-character", { userStatus: userStatus(req) });
	});
};
