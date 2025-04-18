const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      creater_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field:"creater_id",
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field:"category_id",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field:"title",
      },
      description: {
        type: DataTypes.TEXT,
        field:"description",
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        field:"date",
      },
      location: {
        type: DataTypes.STRING(255),
        field:"location",
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field:"price",
      },
      telegramGroup: {
        type:DataTypes.STRING(255),
        allowNull:false,
        field:"telegramgroup",
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull:false,
        field:"capacity",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field:"created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field:"updated_at",
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    }, {
      timestamps:false,
      tableName:"event"
    });

module.exports  = Event;