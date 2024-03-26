import { Sequelize } from "sequelize";

import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB!,
  process.env.MYSQL_USERNAME!,
  process.env.MYSQL_PASSWORD!,
  {
    dialect: "mysql",
    host: process.env.HOST,
  }
);

export default sequelize;
