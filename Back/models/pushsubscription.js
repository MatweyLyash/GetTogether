'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PushSubscription extends Model { }
    PushSubscription.init({
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
        endpoint: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        keys: {
            type: DataTypes.JSONB,
            allowNull: false
            // { p256dh: '...', auth: '...' }
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
        modelName: 'PushSubscription',
        tableName: 'pushsubscriptions',
        timestamps: true
    });
    return PushSubscription;
};
