'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model { }
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt'
    },
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    paranoid: true,
    deletedAt: 'deletedAt',
    timestamps: false
  });
  return Category;
};