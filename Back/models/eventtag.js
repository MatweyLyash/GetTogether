'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EventTag extends Model { }
    EventTag.init({
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: false,
            references: { model: 'events', key: 'id' }
        },
        tag_id: {
            type: DataTypes.INTEGER,
            primaryKey: false,
            references: { model: 'tags', key: 'id' }
        }
    }, {
        sequelize,
        modelName: 'EventTag',
        tableName: 'event_tags',
        timestamps: false
    });
    return EventTag;
};
