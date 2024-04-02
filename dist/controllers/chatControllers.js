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
const messages_1 = __importDefault(require("../models/messages"));
const user_1 = __importDefault(require("../models/user"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const chats = {};
chats.getUserChat = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/chatapp.html"));
};
chats.postUserchats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = req.body.message;
        const groupid = req.params.groupid;
        const createMessage = yield messages_1.default.create({
            message: message,
            UserId: req.user.id,
            usergroupId: groupid,
        });
        return res
            .status(200)
            .json({ success: true, message: message, username: req.user.username });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "cannot send message" });
    }
});
chats.postGroupchats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let groupid = parseInt(req.params.groupid);
        let messageid = parseInt(req.params.messageid);
        if (!messageid) {
            messageid = 0;
        }
        console.log(messageid);
        const allMessages = yield messages_1.default.findAll({
            include: [
                {
                    model: user_1.default,
                    attributes: ["username"],
                },
            ],
            where: {
                id: {
                    [sequelize_1.Op.gt]: messageid,
                },
                usergroupId: groupid,
            },
        });
        allMessages.map((message) => {
            if (message.dataValues.User.dataValues.username == req.user.username) {
                message.dataValues.User.dataValues.username = "you";
            }
            return message;
        });
        return res.status(200).json({
            success: true,
            allMessages: allMessages,
        });
    }
    catch (err) {
        console.log(err);
        console.log("in get group chats error");
        return res.status(400).json({ success: false });
    }
});
exports.default = chats;
