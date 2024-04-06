import Sequelize from "sequelize";

import sequelize from "../util/database";

const files = sequelize.define("files", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default files;
