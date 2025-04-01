const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Status = sequelize.define('Status', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field:"status_name",
      },
    }, {
      timestamps: false,
      tableName:"status"
    });


module.exports = Status;