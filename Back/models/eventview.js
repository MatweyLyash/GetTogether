'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventView extends Model {}
  EventView.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'events', key: 'id' },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    ip_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'EventView',
    tableName: 'event_views',
    timestamps: false,
  });
  return EventView;
};
