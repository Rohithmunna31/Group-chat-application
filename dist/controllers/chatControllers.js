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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const chats = {};
chats.getUserChat = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/chatapp.html"));
};
chats.postUserchats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = req.body.message;
        const createMessage = yield messages_1.default.create({
            message: message,
            UserId: req.user.id,
        });
        return res
            .status(200)
            .json({ success: true, message: message, username: req.user.username });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "cannot send message" });
    }
});
exports.default = chats;