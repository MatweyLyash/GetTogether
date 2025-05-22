'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('events', 'created_at', 'createdAt');
    await queryInterface.renameColumn('events', 'updated_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('events', 'createdAt', 'created_at');
    await queryInterface.renameColumn('events', 'updatedAt', 'updated_at');
  }
};