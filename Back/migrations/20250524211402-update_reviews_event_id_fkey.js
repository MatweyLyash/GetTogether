'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('reviews', 'reviews_event_id_fkey');
    await queryInterface.addConstraint('reviews', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'reviews_event_id_fkey',
      references: {
        table: 'events',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('reviews', 'reviews_event_id_fkey');
    await queryInterface.addConstraint('reviews', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'reviews_event_id_fkey',
      references: {
        table: 'events',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};