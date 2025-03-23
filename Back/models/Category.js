const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

export const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
