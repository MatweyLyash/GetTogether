'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event.init({
    creator_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    location: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    telegram_chat_link: DataTypes.STRING,
    telegram_chat_id: DataTypes.STRING,
    organizer_verification_key: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    image: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'Event',
    deletedAt: 'deletedAt',
    paranoid: true,
  });
  return Event;
};