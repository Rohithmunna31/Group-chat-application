import Sequelize from "sequelize";

import sequelize from "../util/database";

const Groups = sequelize.define("usergroups", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  groupname: {
    type: Sequelize.STRING,
  },
});

export default Groups;
