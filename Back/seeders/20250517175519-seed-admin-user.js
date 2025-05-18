'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin', salt);

    await queryInterface.bulkInsert('users', [
      {
        role_id: 3, 
        telegram: '@AdminUser',
        login: 'admin',
        password_hash: passwordHash,
        is_blocked: false,
        createdAt: new Date(),
        updatedAt: new Date()  
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { login: 'admin' }, {});
  }
};