'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
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
      type: {
        type: Sequelize.ENUM('one_time', 'boost', 'repeat', 'premium'),
        allowNull: false,
      },
      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount_byn: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      amount_usd_cents: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stripe_session_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'expired', 'cancelled'),
        defaultValue: 'pending',
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('promotions', ['event_id']);
    await queryInterface.addIndex('promotions', ['status']);
    await queryInterface.addIndex('promotions', ['stripe_session_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('promotions');
  },
};
