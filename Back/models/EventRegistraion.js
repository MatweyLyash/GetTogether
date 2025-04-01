const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');



const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field:"user_id",
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field:"event_id",
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field:"status_id",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field:"created_at"
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field:"updated_at",
    onUpdate: DataTypes.NOW, 
  },
}, { 
  timestamps: false, 
  tableName:"eventregistration"
});

module.exports = EventRegistration;