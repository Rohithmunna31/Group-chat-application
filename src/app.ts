import express from "express";

import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes";

import chatRoutes from "./routes/chatRoutes";

import sequelize from "./util/database";

import cors from "cors";

import users from "./models/user";

import messages from "./models/messages";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/user", userRoutes);

app.use("/group", chatRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: "true", message: "Successfully done running typescript" });
});

users.hasMany(messages);
messages.belongsTo(users);

sequelize
  .sync()
  .then((res) => {
    console.log("db connection established" + res);
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log("db connection failed");
  });
