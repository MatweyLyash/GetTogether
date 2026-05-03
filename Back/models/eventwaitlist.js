'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EventWaitlist extends Model { }
    EventWaitlist.init({
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
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'events', key: 'id' }
        },
        notification_method: {
            type: DataTypes.ENUM('telegram', 'browser'),
            allowNull: false
        },
        notified_at: {
            type: DataTypes.DATE,
            allowNull: true
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
        modelName: 'EventWaitlist',
        tableName: 'eventwaitlists',
        timestamps: true
    });
    return EventWaitlist;
};
