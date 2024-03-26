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
const user = {};
user.getUsersignup = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/signup.html"));
};
user.postUsersignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    try {
        const find = yield user_1.default.findOne({ where: { email: req.body.email } });
        if (find) {
            console.log("hello");
            return res
                .status(400)
                .json({ success: false, message: "User already exists try loggin" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        const createUser = yield user_1.default.create({
            username: req.body.username,
            email: req.body.email,
            mobileno: req.body.mobileno,
            password: hashedPassword,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: "signup failed" });
    }
    res.status(200).json({ success: true, message: "signup successfull" });
});
exports.default = user;
