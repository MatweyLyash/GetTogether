'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model { }
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
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Название не может быть пустым' },
        len: { args: [1, 255], msg: 'Название должно быть от 1 до 255 символов' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: { args: [0, 1000], msg: 'Описание не должно превышать 1000 символов' }
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Некорректный формат даты' },
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Дата мероприятия должна быть в будущем'
        }
      }
    },
    location: {
      type: DataTypes.STRING(255),
      validate: {
        len: { args: [0, 255], msg: 'Место проведения не должно превышать 255 символов' }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Цена не может быть отрицательной' }
      }
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
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Вместимость должна быть не менее 1 человека' }
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
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