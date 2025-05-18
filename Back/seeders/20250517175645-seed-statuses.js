'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('status', [
      {
        status_name: 'pending',
      },
      {
        status_name: 'approved',
      },
      {
        status_name: 'rejected',
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('status', null, {});
  }
};