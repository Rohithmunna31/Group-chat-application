import Sequelize from "sequelize";

import sequelize from "../util/database";

const usergrouprelation = sequelize.define("usergrouprelation", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  selfGranted: Sequelize.BOOLEAN,
});

export default usergrouprelation;
