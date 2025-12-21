'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EventSubscription extends Model { }
    EventSubscription.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        subscription_type: {
            type: DataTypes.ENUM('organizer', 'category'),
            allowNull: false
        },
        target_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        notification_method: {
            type: DataTypes.ENUM('telegram', 'browser'),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'EventSubscription',
        tableName: 'eventsubscriptions',
        timestamps: true
    });
    return EventSubscription;
};
