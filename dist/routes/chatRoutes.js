"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatControllers_1 = __importDefault(require("../controllers/chatControllers"));
const authentication_1 = __importDefault(require("../util/authentication"));
const router = (0, express_1.Router)();
router.get("/chat", chatControllers_1.default.getUserChat);
router.post("/chat", authentication_1.default.authentication, chatControllers_1.default.postUserchats);
router.post("/chats", authentication_1.default.authentication, chatControllers_1.default.postGroupchats);
exports.default = router;
