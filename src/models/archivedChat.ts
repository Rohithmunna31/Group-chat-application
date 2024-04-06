import Sequelize from "sequelize";

import sequelize from "../util/database";

const archivedChats = sequelize.define("archivedChats", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default archivedChats;
