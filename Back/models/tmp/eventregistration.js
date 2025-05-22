'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventRegistration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EventRegistration.init({
    user_id: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER,
    status_id: DataTypes.INTEGER,
    telegram_invite_link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EventRegistration',
    tableName: 'eventregistration',
    timestamps: true,
  });
  return EventRegistration;
};