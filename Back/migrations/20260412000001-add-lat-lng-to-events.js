'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'latitude', {
      type: Sequelize.DECIMAL(10, 6),
      allowNull: true,
    });
    await queryInterface.addColumn('events', 'longitude', {
      type: Sequelize.DECIMAL(10, 6),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'latitude');
    await queryInterface.removeColumn('events', 'longitude');
  }
};
