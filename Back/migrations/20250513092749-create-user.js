'use strict';
const { DataTypes } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
      },
      telegram: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    }
  );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};