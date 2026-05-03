'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('eventwaitlists', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            event_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'events', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            notification_method: {
                type: Sequelize.ENUM('telegram', 'browser'),
                allowNull: false
            },
            notified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        await queryInterface.addIndex('eventwaitlists',
            ['user_id', 'event_id'],
            { unique: true, name: 'unique_event_waitlist_user' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('eventwaitlists');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_eventwaitlists_notification_method";');
    }
};
