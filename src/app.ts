import express from "express";
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io/"],
  },
});
import { Op } from "sequelize";
import { CronJob } from "cron";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import groupRoutes from "./routes/groupRoutes";
import sequelize from "./util/database";
import cors from "cors";
import user from "./models/user";
import message from "./models/messages";
import archivedChats from "./models/archivedChat";
import Group from "./models/usergroups";
import usergrouprelation from "./models/usergrouprelation";
import files from "./models/files";
import { Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { error } from "console";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/user", userRoutes);

app.use("/group", chatRoutes);

app.use("/group", groupRoutes);

app.get("/test-cron", (req, res) => {
  try {
    moveintoArchives();
    return res
      .status(200)
      .json({ success: true, message: "Done with cronjob" });
  } catch (err) {
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

io.on("connection", (socket: any) => {
  console.log("iam in on websockets.io connection");

  socket.on("send-message", (message: string, groupid: number) => {
    if (!groupid) {
      socket.broadcast.emit("recieve-message", message);
    } else {
      socket.to(groupid).emit("recieve-message", message);
      console.log("message sent to that particular group id");
    }
    console.log("This is custom event", message);
  });
  socket.on("join-room", (groupid: number, cb: CallableFunction) => {
    socket.join(groupid);
    cb(`joined ${groupid}`);
  });

  socket.on("new-user", (username: string, room: number) => {
    socket.to(room).emit("chat-message", { username: username });
  });
});

async function moveintoArchives() {
  const t = await sequelize.transaction();
  try {
    const requiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const allMessages = await message.findAll({
      where: {
        createdAt: {
          [Op.lt]: requiredDate,
        },
      },
    });

    const creatingChats = await archivedChats.bulkCreate(
      allMessages.map((msg) => ({
        message: msg.dataValues.message,
        UserId: msg.dataValues.UserId,
        usergroupId: msg.dataValues.usergroupId,
      })),
      { transaction: t }
    );

    await message.destroy({
      where: {
        createdAt: {
          [Op.lt]: requiredDate,
        },
      },
      transaction: t,
    });

    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
    throw error(err);
  }
}

const job = new CronJob(
  "0 0 * * *",
  moveintoArchives,
  null,
  true,
  "America/Los_Angeles"
);

job.start();

instrument(io, { auth: false });

user.hasMany(message);
message.belongsTo(user);

message.belongsTo(Group);
Group.hasMany(message);

user.hasMany(archivedChats);
archivedChats.belongsTo(user);

archivedChats.belongsTo(Group);
Group.hasMany(archivedChats);

user.belongsToMany(Group, { through: usergrouprelation });
Group.belongsToMany(user, { through: usergrouprelation });

files.belongsTo(user);
user.hasMany(files);

files.belongsTo(Group);
Group.hasMany(files);

sequelize
  .sync()
  .then((res) => {
    console.log("db connection established" + res);
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);

    console.log("db connection failed");
  });
