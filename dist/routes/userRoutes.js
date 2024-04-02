"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userControllers_1 = __importDefault(require("../controllers/userControllers"));
const router = (0, express_1.Router)();
router.get("/signup", userControllers_1.default.getUsersignup);
router.post("/signup", userControllers_1.default.postUsersignup);
router.get("/login", userControllers_1.default.getUserlogin);
router.post("/login", userControllers_1.default.postUserlogin);
router.get("/home", userControllers_1.default.getUserhome);
router.get("/removeuser/:groupid/:userid", userControllers_1.default.removeUser);
router.get("/makeadmin/:groupid/:userid", userControllers_1.default.makeAdmin);
router.post("/searchusers", userControllers_1.default.searchUsers);
router.post("/adduser/:groupid", userControllers_1.default.addUser);
exports.default = router;
