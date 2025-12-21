// seeders/YYYYMMDDHHMMSS-seed-roles.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        role_name: 'member'
      },
      {
        role_name: 'organizer'
      },
      {
        role_name: 'admin'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};