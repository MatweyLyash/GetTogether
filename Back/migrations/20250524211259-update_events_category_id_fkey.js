'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('events', 'events_category_id_fkey1');
    await queryInterface.addConstraint('events', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'events_category_id_fkey',
      references: {
        table: 'categories',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('events', 'events_category_id_fkey');
    await queryInterface.addConstraint('events', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'events_category_id_fkey1',
      references: {
        table: 'categories',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};