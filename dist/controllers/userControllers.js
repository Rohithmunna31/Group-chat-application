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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usergrouprelation_1 = __importDefault(require("../models/usergrouprelation"));
dotenv_1.default.config();
const user = {};
user.getUsersignup = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/signup.html"));
};
user.postUsersignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = yield user_1.default.findOne({ where: { email: req.body.email } });
        if (find) {
            console.log("hello");
            return res
                .status(400)
                .json({ success: false, message: "User already exists try loggin" });
        }
        bcrypt_1.default.hash(req.body.password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, message: "error signup user" });
            }
            if (hash) {
                const createUser = yield user_1.default.create({
                    username: req.body.username,
                    email: req.body.email,
                    mobileno: req.body.mobileno,
                    password: hash,
                });
            }
        }));
    }
    catch (err) {
        // console.log(err);
        console.log("catched err");
        return res.status(400).json({ success: false, message: "signup failed" });
    }
    res.status(200).json({ success: true, message: "signup successfull" });
});
user.getUserlogin = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/login.html"));
};
user.postUserlogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email } = req.body;
        const find = yield user_1.default.findOne({ where: { email: email } });
        if (find) {
            bcrypt_1.default.compare(password, find.dataValues.password, (err, data) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "err occured logging in",
                    });
                }
                if (data === true) {
                    console.log("in paswword matched");
                    return res.status(200).json({
                        message: "password matched succesfully",
                        token: generateacesstoken(find.dataValues.id, find.dataValues.username),
                    });
                }
                else {
                    res.status(401).json({
                        success: false,
                        message: "User not Authorized ",
                    });
                }
            });
        }
        else {
            return res
                .status(404)
                .json({ success: true, message: "User not found " });
        }
    }
    catch (err) {
        // console.log(err);
        console.log("in try catch error");
        return res
            .status(400)
            .json({ success: true, message: "an error occured loggin in" });
    }
});
user.getUserhome = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/userhome.html"));
};
user.removeUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userid = req.params.userid;
        const groupid = req.params.groupid;
        const thisuser = yield usergrouprelation_1.default.findOne({
            where: {
                UserId: userid,
                usergroupId: groupid,
            },
        });
        if (thisuser) {
            yield usergrouprelation_1.default.destroy({
                where: {
                    UserId: userid,
                    usergroupId: groupid,
                },
            });
        }
        else {
            return res
                .status(200)
                .json({ success: false, message: "user is removed from group" });
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        // console.log(err);
        return res
            .status(400)
            .json({ success: false, message: "error making admin" });
    }
});
user.makeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userid = req.params.userid;
        const groupid = req.params.groupid;
        yield usergrouprelation_1.default.destroy({
            where: {
                UserId: userid,
                usergroupId: groupid,
            },
        });
        const createdrelation = yield usergrouprelation_1.default.create({
            selfGranted: true,
            UserId: userid,
            usergroupId: groupid,
        });
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
});
user.searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.body.query.toLowerCase();
        const foundUsers = yield user_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.like]: `%${query}%` } },
                    { email: { [sequelize_1.Op.like]: `%${query}%` } },
                ],
            },
        });
        // Return the found users
        res.status(200).json({ success: true, users: foundUsers });
    }
    catch (error) {
        console.error("Error searching for users:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
user.addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupid = req.params.groupid;
        const username = req.body.username;
        const userdetails = yield user_1.default.findOne({
            where: {
                username: username,
            },
        });
        if (userdetails) {
            const addUser = yield usergrouprelation_1.default.findOne({
                where: {
                    UserId: userdetails.dataValues.id,
                    usergroupId: groupid,
                },
            });
            if (!addUser) {
                console.log("in adding user to the group");
                yield usergrouprelation_1.default.create({
                    UserId: userdetails.dataValues.id,
                    usergroupId: groupid,
                });
                return res
                    .status(200)
                    .json({ success: true, message: "added user to the group" });
            }
            else {
                return res
                    .status(400)
                    .json({ success: false, message: "user already in group" });
            }
        }
        else {
            return res.status(400).json({ success: false, message: "" });
        }
    }
    catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "an error occured" });
    }
});
function generateacesstoken(id, username) {
    return jsonwebtoken_1.default.sign({ userId: id, username: username }, "secretkey");
}
exports.default = user;
