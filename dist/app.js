"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const database_1 = __importDefault(require("./util/database"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use("/user", userRoutes_1.default);
app.get("/", (req, res) => {
    res
        .status(200)
        .json({ success: "true", message: "Successfully done running typescript" });
});
database_1.default
    .sync()
    .then((res) => {
    console.log("db connection established" + res);
    app.listen(process.env.PORT);
})
    .catch((err) => {
    console.log("db connection failed");
});
