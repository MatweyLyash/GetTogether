'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('events', 'deleted_at', 'deletedAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('events', 'deletedAt', 'deleted_at');
  }
};