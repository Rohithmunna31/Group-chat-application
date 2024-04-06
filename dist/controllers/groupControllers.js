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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const files_1 = __importDefault(require("../models/files"));
const user_1 = __importDefault(require("../models/user"));
const usergroups_1 = __importDefault(require("../models/usergroups"));
const usergrouprelation_1 = __importDefault(require("../models/usergrouprelation"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const usergroups_2 = __importDefault(require("../models/usergroups"));
const sequelize_1 = require("sequelize");
const groups = {};
groups.postGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupname = req.body.groupname;
        const thisGroup = yield usergroups_1.default.create({
            groupname: groupname,
        });
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
        res.status(200).json({
            success: true,
            groups: getUsergroups,
            username: req.user.username,
        });
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
groups.uploadfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "cannot get file" });
        }
        console.log(req.file);
        const groupid = req.params.groupid;
        const username = req.params.username;
        const userDetails = yield user_1.default.findOne({
            where: { username: username },
        });
        aws_sdk_1.default.config.update({
            region: "ap-southeast-2",
            accessKeyId: process.env.AWS_IAM_USER_KEY,
            secretAccessKey: process.env.AWS_IAM_USER_SECRET,
        });
        const imagePath = req.file.path;
        const contentType = imagePath.endsWith(".jpg")
            ? "image/jpeg"
            : imagePath.endsWith(".png")
                ? "image/png"
                : "image/jpeg";
        const s3 = new aws_sdk_1.default.S3();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `file${groupid}${username}/${new Date().toLocaleString()}`,
            Body: fs_1.default.createReadStream(req.file.path),
            ACL: "public-read",
            ContentType: contentType,
        };
        function uploadtos3(uploadParams) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    s3.upload(uploadParams, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data.Location);
                        }
                    });
                });
            });
        }
        const fileUrl = yield uploadtos3(uploadParams);
        console.log("File uploaded successfully. URL:", fileUrl);
        console.log("this is fileUrl2", fileUrl);
        yield files_1.default.create({
            fileUrl: fileUrl,
            usergroupId: groupid,
            UserId: userDetails === null || userDetails === void 0 ? void 0 : userDetails.dataValues.id,
        });
        res.status(200).json({
            success: true,
            message: "upload done successfully",
            fileUrl: fileUrl,
        });
    }
    catch (err) {
        return res.status(400).json({ success: true, message: "failed uploading" });
    }
});
exports.default = groups;
