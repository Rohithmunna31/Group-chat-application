"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
dotenv_1.default.config();
const middleWare = {};
middleWare.authentication = (req, res, next) => {
    const token = req.body.Authorization;
    console.log(token);
    if (!token) {
        console.log("here in !token");
        return res
            .status(401)
            .json({ message: "Authorization token not provided" });
    }
    try {
        console.log(process.env.SECRET_KEY);
        const user = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        user_1.default.findByPk(user.userId)
            .then((userone) => {
            if (!userone) {
                return res.status(401).json({ message: "User not found" });
            }
            req.user = userone.dataValues;
            next();
        })
            .catch((err) => {
            console.error(err);
            return res.status(500).json({ message: "Internal server error" });
        });
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.default = middleWare;
