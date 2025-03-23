const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

export const Status = sequelize.define('Status', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    }, {
      timestamps: false,
    });