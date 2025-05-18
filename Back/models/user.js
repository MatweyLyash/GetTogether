'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    role_id: DataTypes.INTEGER,
    telegram: DataTypes.STRING,
    login: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    is_blocked: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'users',
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt', // Явно указываем имя столбца
    updatedAt: 'updatedAt',
  });
  return User;
};