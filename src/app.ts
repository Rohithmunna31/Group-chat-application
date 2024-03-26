import express from "express";

import bodyParser from "body-parser";

import signupRoutes from "./routes/userRoutes";

import sequelize from "./util/database";

import cors from "cors";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/user", signupRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: "true", message: "Successfully done running typescript" });
});

sequelize
  .sync()
  .then((res) => {
    console.log("db connection established" + res);
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log("db connection failed");
  });
