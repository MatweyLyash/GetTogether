'use strict';

module.exports = (sequelize, DataTypes) => {
  const Promotion = sequelize.define('Promotion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('one_time', 'boost', 'repeat', 'premium'),
      allowNull: false,
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount_byn: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amount_usd_cents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stripe_session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled'),
      defaultValue: 'pending',
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'promotions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Promotion;
};
