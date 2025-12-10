'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('achievements', 'trigger', {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: 'apply', // apply | attend | category
    });
    await queryInterface.addColumn('achievements', 'condition_event_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'events', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('achievements', 'condition_category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'categories', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('achievements', 'condition_payload', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('achievements', 'condition_payload');
    await queryInterface.removeColumn('achievements', 'condition_category_id');
    await queryInterface.removeColumn('achievements', 'condition_event_id');
    await queryInterface.removeColumn('achievements', 'trigger');
  }
};


