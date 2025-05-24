'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('events', 'events_category_id_fkey');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('events', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'events_category_id_fkey',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  }
};