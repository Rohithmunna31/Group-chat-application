import express from "express";
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io/"],
  },
});
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import groupRoutes from "./routes/groupRoutes";
import sequelize from "./util/database";
import cors from "cors";
import user from "./models/user";
import message from "./models/messages";
import Group from "./models/usergroups";
import usergrouprelation from "./models/usergrouprelation";
import files from "./models/files";
import { Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/user", userRoutes);

app.use("/group", chatRoutes);

app.use("/group", groupRoutes);

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

instrument(io, { auth: false });

user.hasMany(message);
message.belongsTo(user);

message.belongsTo(Group);
Group.hasMany(message);

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
