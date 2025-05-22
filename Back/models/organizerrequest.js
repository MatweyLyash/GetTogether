'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizerRequest extends Model {}
  OrganizerRequest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'statuses', key: 'id' }
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
    modelName: 'OrganizerRequest',
    tableName: 'organizerrequests',
    timestamps: true,
  });
  return OrganizerRequest;
};