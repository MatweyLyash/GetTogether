// migrations/20250522001001-create-statuses.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('statuses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('statuses');
  }
};