'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Удаляем дублирующиеся ключи в events
    await queryInterface.removeConstraint('events', 'events_creator_id_fkey');
    // Удаляем дублирующиеся ключи в eventregistrations
    await queryInterface.removeConstraint('eventregistrations', 'eventregistrations_status_id_fkey');
    await queryInterface.removeConstraint('eventregistrations', 'eventregistrations_user_id_fkey');
    // Удаляем дублирующийся ключ в reviews
    await queryInterface.removeConstraint('reviews', 'reviews_user_id_fkey');
  },
  async down(queryInterface, Sequelize) {
    // Восстанавливаем удалённые ключи
    await queryInterface.addConstraint('events', {
      fields: ['creator_id'],
      type: 'foreign key',
      name: 'events_creator_id_fkey',
      references: { table: 'users', field: 'id' }
    });
    await queryInterface.addConstraint('eventregistrations', {
      fields: ['status_id'],
      type: 'foreign key',
      name: 'eventregistrations_status_id_fkey',
      references: { table: 'statuses', field: 'id' }
    });
    await queryInterface.addConstraint('eventregistrations', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'eventregistrations_user_id_fkey',
      references: { table: 'users', field: 'id' }
    });
    await queryInterface.addConstraint('reviews', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'reviews_user_id_fkey',
      references: { table: 'users', field: 'id' }
    });
  }
};