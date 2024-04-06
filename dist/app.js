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
const express_1 = __importDefault(require("express"));
const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io/"],
    },
});
const sequelize_1 = require("sequelize");
const cron_1 = require("cron");
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const database_1 = __importDefault(require("./util/database"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./models/user"));
const messages_1 = __importDefault(require("./models/messages"));
const archivedChat_1 = __importDefault(require("./models/archivedChat"));
const usergroups_1 = __importDefault(require("./models/usergroups"));
const usergrouprelation_1 = __importDefault(require("./models/usergrouprelation"));
const files_1 = __importDefault(require("./models/files"));
const admin_ui_1 = require("@socket.io/admin-ui");
const console_1 = require("console");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use("/user", userRoutes_1.default);
app.use("/group", chatRoutes_1.default);
app.use("/group", groupRoutes_1.default);
app.get("/test-cron", (req, res) => {
    try {
        moveintoArchives();
        return res
            .status(200)
            .json({ success: true, message: "Done with cronjob" });
    }
    catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "error with  cron job" });
    }
});
app.get("/", (req, res) => {
    res
        .status(200)
        .json({ success: "true", message: "Successfully done running typescript" });
});
io.on("connection", (socket) => {
    console.log("iam in on websockets.io connection");
    socket.on("send-message", (message, groupid) => {
        if (!groupid) {
            socket.broadcast.emit("recieve-message", message);
        }
        else {
            socket.to(groupid).emit("recieve-message", message);
            console.log("message sent to that particular group id");
        }
        console.log("This is custom event", message);
    });
    socket.on("join-room", (groupid, cb) => {
        socket.join(groupid);
        cb(`joined ${groupid}`);
    });
    socket.on("new-user", (username, room) => {
        socket.to(room).emit("chat-message", { username: username });
    });
});
function moveintoArchives() {
    return __awaiter(this, void 0, void 0, function* () {
        const t = yield database_1.default.transaction();
        try {
            const requiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
            const allMessages = yield messages_1.default.findAll({
                where: {
                    createdAt: {
                        [sequelize_1.Op.lt]: requiredDate,
                    },
                },
            });
            const creatingChats = yield archivedChat_1.default.bulkCreate(allMessages.map((msg) => ({
                message: msg.dataValues.message,
                UserId: msg.dataValues.UserId,
                usergroupId: msg.dataValues.usergroupId,
            })), { transaction: t });
            yield messages_1.default.destroy({
                where: {
                    createdAt: {
                        [sequelize_1.Op.lt]: requiredDate,
                    },
                },
                transaction: t,
            });
            yield t.commit();
        }
        catch (err) {
            yield t.rollback();
            console.log(err);
            throw (0, console_1.error)(err);
        }
    });
}
const job = new cron_1.CronJob("0 0 * * *", moveintoArchives, null, true, "America/Los_Angeles");
job.start();
(0, admin_ui_1.instrument)(io, { auth: false });
user_1.default.hasMany(messages_1.default);
messages_1.default.belongsTo(user_1.default);
messages_1.default.belongsTo(usergroups_1.default);
usergroups_1.default.hasMany(messages_1.default);
user_1.default.hasMany(archivedChat_1.default);
archivedChat_1.default.belongsTo(user_1.default);
archivedChat_1.default.belongsTo(usergroups_1.default);
usergroups_1.default.hasMany(archivedChat_1.default);
user_1.default.belongsToMany(usergroups_1.default, { through: usergrouprelation_1.default });
usergroups_1.default.belongsToMany(user_1.default, { through: usergrouprelation_1.default });
files_1.default.belongsTo(user_1.default);
user_1.default.hasMany(files_1.default);
files_1.default.belongsTo(usergroups_1.default);
usergroups_1.default.hasMany(files_1.default);
database_1.default
    .sync()
    .then((res) => {
    console.log("db connection established" + res);
    app.listen(process.env.PORT);
})
    .catch((err) => {
    console.log(err);
    console.log("db connection failed");
});
