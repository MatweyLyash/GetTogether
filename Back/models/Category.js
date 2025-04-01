const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field:"category_name",
    },
  }, {
    timestamps: false,
    tableName:"category"
  });

  module.exports = Category;
