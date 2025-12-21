'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('eventregistrations', 'eventregistrations_event_id_fkey1');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('eventregistrations', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'eventregistrations_event_id_fkey1',
      references: {
        table: 'events',
        field: 'id'
      },
      onUpdate: 'CASCADE'
    });
  }
};