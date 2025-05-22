'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {}
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'categories', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255)
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    telegram_chat_link: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    telegram_chat_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organizer_verification_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
    paranoid: true
  });
  return Event;
};