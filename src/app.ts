import express from "express";

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

user.hasMany(message);
message.belongsTo(user);

message.belongsTo(Group);
Group.hasMany(message);

user.belongsToMany(Group, { through: usergrouprelation });
Group.belongsToMany(user, { through: usergrouprelation });

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
