'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('eventregistrations', 'eventregistrations_event_id_fkey');
    await queryInterface.addConstraint('eventregistrations', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'eventregistrations_event_id_fkey',
      references: {
        table: 'events',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('eventregistrations', 'eventregistrations_event_id_fkey');
    await queryInterface.addConstraint('eventregistrations', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'eventregistrations_event_id_fkey',
      references: {
        table: 'events',
        field: 'id'
      }
    });
  }
};