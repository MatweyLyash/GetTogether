module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('event_views', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      ip_hash: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('event_views', ['event_id']);
    await queryInterface.addIndex('event_views', ['viewed_at']);
    await queryInterface.addIndex('event_views', ['event_id', 'viewed_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('event_views');
  },
};
