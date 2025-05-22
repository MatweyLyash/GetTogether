'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Review.init({
    user_id: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'review',
    timestamps: true,
  });
  return Review;
};