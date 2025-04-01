const {DataTypes } = require('sequelize');
const sequelize = require('../config/db');

  const Role = sequelize.define('Role', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        role_name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field:"role_name",
        },
      }, {
        timestamps: false,
        tableName:"role"
      });
  
  module.exports  = Role;