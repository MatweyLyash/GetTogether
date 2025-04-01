const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { mapFinderOptions } = require('sequelize/lib/utils');

const OrganizerRequest = sequelize.define('OrganizerRequest', {
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
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field:"status_id",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  }, {
    timestamps: false,
    tableName:"organizerrequest"
  });

module.exports = OrganizerRequest;