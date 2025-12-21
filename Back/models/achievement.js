'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Achievement extends Model {}
  Achievement.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    trigger: {
      type: DataTypes.STRING(32), // apply | attend | category
      allowNull: false,
      defaultValue: 'apply'
    },
    condition_event_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    condition_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    condition_payload: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Achievement',
    tableName: 'achievements',
    timestamps: true
  });
  return Achievement;
};

