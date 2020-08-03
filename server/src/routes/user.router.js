"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var passport_1 = require("passport");
var models_1 = require("../models");
var mongoose_1 = require("mongoose");
var lodash_1 = require("lodash");
var middleware_1 = require("../config/middleware");
var ObjectId = mongoose_1.Types.ObjectId;
function default_1(router) {
    var _this = this;
    router.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, username, password, password2, token, characterName, playerData, response, user, userInsert;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, username = _a.username, password = _a.password, password2 = _a.password2, token = _a.token, characterName = _a.characterName;
                    return [4 /*yield*/, models_1.Player.findOne({ token: token, name: characterName })];
                case 1:
                    playerData = _b.sent();
                    if (!!playerData) return [3 /*break*/, 2];
                    middleware_1.flash('error', 'Token or player name does not match. Please double check.');
                    res.redirect('/register');
                    return [3 /*break*/, 11];
                case 2:
                    if (!playerData.webUserId) return [3 /*break*/, 3];
                    middleware_1.flash('error', 'Player is already registered. If you think this is incorrect, please reset your token.');
                    res.redirect('/register');
                    return [3 /*break*/, 11];
                case 3:
                    if (!(username === '' || password === '' || password2 === '')) return [3 /*break*/, 4];
                    middleware_1.flash('error', 'Please fill in all required fields.');
                    res.redirect('/register');
                    return [3 /*break*/, 11];
                case 4:
                    if (!(password === password2)) return [3 /*break*/, 10];
                    return [4 /*yield*/, models_1.User.findOne({ username: username })];
                case 5:
                    response = _b.sent();
                    if (!response) return [3 /*break*/, 6];
                    middleware_1.flash('error', 'Username already taken!');
                    res.redirect('/register');
                    return [3 /*break*/, 9];
                case 6:
                    user = new models_1.User({
                        username: username,
                        password: password,
                        email: email,
                        characters: [playerData._id]
                    });
                    return [4 /*yield*/, user.encryptPass()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, models_1.User.create(user.toObject())];
                case 8:
                    userInsert = _b.sent();
                    console.log(userInsert);
                    if (userInsert) {
                        middleware_1.flash('success', "Welcome, player " + user.username + "!");
                        res.redirect('/login');
                    }
                    else {
                        middleware_1.flash('error', 'Could not register you. Please try again later.');
                        res.redirect('/register');
                    }
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    middleware_1.flash('error', 'Passwords do not match.');
                    res.redirect('/register');
                    _b.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    }); });
    router.post('/api/login', function (req, res, next) {
        if (req.body.rememberMe) {
            // 6 months
            req.session.cookie.originalMaxAge = 60000 * 60 * 24 * 7 * 26;
        }
        else {
            // 24 hours
            req.session.cookie.originalMaxAge = 60000 * 60 * 24;
        }
        next();
    }, passport_1["default"].authenticate('local', {
        successRedirect: '/inventory',
        failureRedirect: '/login',
        failureFlash: true
    }));
    router.get('/inventory', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var defaultPlayer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!req.user) return [3 /*break*/, 1];
                    middleware_1.flash('error', 'Must log in to see inventory.');
                    res.redirect('/login');
                    return [3 /*break*/, 4];
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, models_1.User.findOne({
                            _id: ObjectId(req.user)
                        }).populate('defaultPlayer')];
                case 2:
                    defaultPlayer = (_a.sent()).defaultPlayer;
                    res.render('inventory', {
                        player: defaultPlayer.toObject()
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.trace(error_1);
                    middleware_1.serverError(res);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.get('/inventory/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var player, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!req.user) return [3 /*break*/, 1];
                    middleware_1.flash('error', 'Must log in to see inventory.');
                    res.redirect('/login');
                    return [3 /*break*/, 4];
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, models_1.Player.findOne({ _id: Object(req.params.id) })];
                case 2:
                    player = _a.sent();
                    res.render('inventory', {
                        player: player.toObject()
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.trace(error_2);
                    middleware_1.serverError(res);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.put('/inventory', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var putInventory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    putInventory = require('../config/middleware/putInventory');
                    return [4 /*yield*/, putInventory(req, res, {
                            Player: models_1.Player,
                            isEqual: lodash_1.isEqual,
                            ObjectId: ObjectId
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    router.get('/logout', function (req, res) {
        req.logout();
        middleware_1.flash('success', 'You are logged out.');
        res.redirect('/login');
    });
    router.post('/api/add-character', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, token, characterName, playerData_1, user, characterCheck, playerResponse, userResponse, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    if (!!req.user) return [3 /*break*/, 1];
                    middleware_1.flash('error', 'Please login to add new character.');
                    res.redirect('/login');
                    return [3 /*break*/, 7];
                case 1:
                    _a = req.body, token = _a.token, characterName = _a.characterName;
                    console.log(token, characterName);
                    if (!token || !characterName) {
                        middleware_1.flash('error', 'Both fields are required.');
                        res.redirect('/add-character');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, models_1.Player.findOne({ token: token, name: characterName })];
                case 2:
                    playerData_1 = _b.sent();
                    if (!playerData_1) return [3 /*break*/, 6];
                    return [4 /*yield*/, models_1.User.findOne({ _id: ObjectId(req.user) }).populate('players')];
                case 3:
                    user = _b.sent();
                    characterCheck = user.players.filter(function (p) { return playerData_1._id.toString() === p._id.toString(); });
                    if (characterCheck.length > 0) {
                        middleware_1.flash('error', req.body.characterName + " has already been added to your character list.");
                        res.redirect('/add-character');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, models_1.Player.updateOne({ _id: ObjectId(playerData_1._id) }, { webUserId: req.user })];
                case 4:
                    playerResponse = _b.sent();
                    return [4 /*yield*/, models_1.User.updateOne({ _id: ObjectId(req.user) }, { $push: { players: playerData_1._id } })];
                case 5:
                    userResponse = _b.sent();
                    if (userResponse.nModified === 1 && playerResponse.nModified === 1) {
                        middleware_1.flash('success', "Added " + playerData_1.name + " to your list of characters.");
                        res.redirect('/add-character');
                    }
                    else {
                        middleware_1.flash('error', "Unexpected error: Could not add " + playerData_1.name + " to your list of characters.");
                        res.redirect('/add-character');
                    }
                    return [3 /*break*/, 7];
                case 6:
                    middleware_1.flash('error', "Sorry, either that character doesn't exist, or the token was incorrect.");
                    res.redirect('/add-character');
                    _b.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_3 = _b.sent();
                    console.log(error_3);
                    middleware_1.serverError(res);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); });
    router.post('/change-default-char', middleware_1.isAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var player, playerWebUserId, userId, nModified;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1.Player.findOne({ _id: ObjectId(req.body.characterId) })];
                case 1:
                    player = _a.sent();
                    playerWebUserId = ObjectId(player.webUserId), userId = ObjectId(req.user);
                    if (!playerWebUserId.equals(userId)) {
                        middleware_1.flash('error', 'Something weird happened.');
                        res.redirect('/all-characters');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, models_1.User.updateOne({ _id: ObjectId(req.user) }, { defaultPlayer: player._id })];
                case 2:
                    nModified = (_a.sent()).nModified;
                    if (nModified === 1) {
                        middleware_1.flash('success', player.name + " is now your default character.");
                        res.redirect('/all-characters');
                    }
                    else {
                        middleware_1.flash('error', player.name + " is already your default character.");
                        res.redirect('/all-characters');
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    router.get('/all-characters', middleware_1.isAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var allCharacters;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1.Player.find({ webUserId: req.user })];
                case 1:
                    allCharacters = (_a.sent()).map(function (p) { return p.toObject(); });
                    res.render('all-characters', {
                        characters: allCharacters
                    });
                    return [2 /*return*/];
            }
        });
    }); });
}
exports["default"] = default_1;
