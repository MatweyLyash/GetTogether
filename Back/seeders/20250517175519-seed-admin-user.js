// seeders/YYYYMMDDHHMMSS-seed-users.js
'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('admin', 10);
    const adminRole = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name = 'admin'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!adminRole.length) {
      throw new Error('Role "admin" not found');
    }

    await queryInterface.bulkInsert('users', [
      {
        role_id: adminRole[0].id,
        telegram: '@AdminUser',
        login: 'admin',
        password_hash: passwordHash,
        is_blocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { login: 'admin' }, {});
  }
};