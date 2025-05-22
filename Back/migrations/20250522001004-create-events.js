// migrations/20250522001002-create-events.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255)
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      telegram_chat_link: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      telegram_chat_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      organizer_verification_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      image: {
        type: Sequelize.BLOB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('events');
  }
};