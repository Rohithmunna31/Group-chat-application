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
const usergroups_1 = __importDefault(require("../models/usergroups"));
const usergrouprelation_1 = __importDefault(require("../models/usergrouprelation"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const usergroups_2 = __importDefault(require("../models/usergroups"));
const sequelize_1 = require("sequelize");
const groups = {};
groups.postGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupname = req.body.groupname;
        const thisGroup = yield usergroups_1.default.create({
            groupname: groupname,
        });
        console.log(thisGroup.dataValues.id);
        yield usergrouprelation_1.default.create({
            selfGranted: true,
            UserId: req.user.id,
            usergroupId: thisGroup.dataValues.id,
        });
        res
            .status(200)
            .json({ success: true, message: "group created successfully" });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "failed creating group" });
    }
});
groups.getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getUsergroups = yield usergroups_1.default.findAll({
            include: [
                {
                    model: user_1.default,
                    where: {
                        id: req.user.id,
                    },
                },
            ],
        });
        console.log(getUsergroups);
        res.status(200).json({ success: true, groups: getUsergroups });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ success: true, message: "failed getting groups" });
    }
});
groups.getJoingroup = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/joingroup.html"));
};
groups.postJoingroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in post join group");
    try {
        const groupid = req.params.groupid;
        const { password, email } = req.body;
        const find = yield user_1.default.findOne({ where: { email: email } });
        if (find) {
            bcrypt_1.default.compare(password, find.dataValues.password, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    return res.status(404).json({
                        success: false,
                        message: "err joining group",
                    });
                }
                if (data === true) {
                    console.log("joining group ");
                    const relation = yield usergrouprelation_1.default.findAll({
                        where: {
                            UserId: find.dataValues.id,
                            usergroupId: groupid,
                        },
                    });
                    console.log(relation);
                    if (relation.length == 0) {
                        console.log("creating user group relation");
                        yield usergrouprelation_1.default.create({
                            UserId: find.dataValues.id,
                            usergroupId: groupid,
                        });
                        return res
                            .status(200)
                            .json({ success: true, message: "joined group successfully" });
                    }
                    else {
                        console.log("user already in group");
                        return res
                            .status(404)
                            .json({ success: false, message: "user already in the group" });
                    }
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: "User not Authorized",
                    });
                }
            }));
        }
        else {
            return res
                .status(404)
                .json({ success: true, message: "User not found " });
        }
    }
    catch (err) {
        console.log(err);
        return res
            .status(400)
            .json({ success: true, message: "an error occured loggin in" });
    }
});
groups.getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in getting users");
    try {
        const groupid = req.params.groupid;
        const isadmin = yield usergrouprelation_1.default.findOne({
            where: {
                UserId: req.user.id,
                usergroupId: groupid,
            },
        });
        console.log("isadmin", isadmin);
        const thisgroupsusers = yield user_1.default.findAll({
            include: [
                {
                    model: usergroups_2.default,
                    where: {
                        id: groupid,
                    },
                },
            ],
        });
        const othergroupusers = yield user_1.default.findAll({
            include: [
                {
                    model: usergroups_2.default,
                    where: {
                        id: {
                            [sequelize_1.Op.not]: groupid,
                        },
                    },
                },
            ],
        });
        console.log(isadmin);
        res.status(200).json({
            success: true,
            isadmin: isadmin === null || isadmin === void 0 ? void 0 : isadmin.dataValues.selfGranted,
            thisgroupsusers: thisgroupsusers,
            othergroupusers: othergroupusers,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
});
exports.default = groups;
