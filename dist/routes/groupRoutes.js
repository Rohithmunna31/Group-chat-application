"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupControllers_1 = __importDefault(require("../controllers/groupControllers"));
const authentication_1 = __importDefault(require("../util/authentication"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "uploads/" });
const router = (0, express_1.Router)();
router.post("/creategroup", authentication_1.default.authentication, groupControllers_1.default.postGroup);
router.post("/getgroups", authentication_1.default.authentication, groupControllers_1.default.getGroups);
router.post("/getusers/:groupid", authentication_1.default.authentication, groupControllers_1.default.getUsers);
router.post("/upload-file/:groupid/:username", upload.single("file"), groupControllers_1.default.uploadfile);
router.get("/joingroup/:groupid", groupControllers_1.default.getJoingroup);
router.post("/joingroup/:groupid", groupControllers_1.default.postJoingroup);
exports.default = router;
