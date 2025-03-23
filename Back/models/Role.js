const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

export const Role = sequelize.define('Role', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    }, {
      timestamps: false,
    });
