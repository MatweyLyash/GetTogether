const {  Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define ('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
      },
      telegram: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
      },
      login:{
        type: DataTypes.STRING(50),
        allowNull:false,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_blocked',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    }, {
        timestamps: false,
        underscored: true,
      }
);
module.exports = User
