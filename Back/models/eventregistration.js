// models/eventregistration.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventRegistration extends Model {}
  EventRegistration.init({
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
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'events', key: 'id' }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'statuses', key: 'id' }
    },
    telegram_invite_link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qr_code: {
      type: DataTypes.BLOB,
      allowNull: true,
      comment: 'QR code as binary data (PNG image), generated when registration is approved'
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
    modelName: 'EventRegistration',
    tableName: 'eventregistrations',
    timestamps: true,
  });
  return EventRegistration;
};