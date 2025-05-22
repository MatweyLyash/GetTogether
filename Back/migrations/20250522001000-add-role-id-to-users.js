// migrations/20250522001000-add-role-id-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'role_id');
  }
};