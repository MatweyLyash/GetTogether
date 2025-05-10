const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field:"creator_id",
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
      telegram_chat_link: {
        type:DataTypes.STRING(255),
        allowNull:true,
        field:"telegram_chat_link",
      },
      telegram_chat_id:{
        type: DataTypes.STRING,
        allowNull: true
      },
      organizer_verification_key: {
        type: DataTypes.STRING,
        allowNull: true
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
      image : {
        type: DataTypes.BLOB,
        allowNull: true,
        field:"image",
      },

      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field:"updated_at",
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    }, {
      timestamps:true,
      tableName:"event",
      updatedAt:"updated_at",
      createdAt:"created_at",
    });

module.exports  = Event;