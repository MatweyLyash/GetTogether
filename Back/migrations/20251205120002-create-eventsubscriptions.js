'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('eventsubscriptions', {
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
            subscription_type: {
                type: Sequelize.ENUM('organizer', 'category'),
                allowNull: false
            },
            target_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            notification_method: {
                type: Sequelize.ENUM('telegram', 'browser'),
                allowNull: false
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

        // Уникальный индекс для предотвращения дублирующих подписок
        await queryInterface.addIndex('eventsubscriptions',
            ['user_id', 'subscription_type', 'target_id', 'notification_method'],
            { unique: true, name: 'unique_subscription' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('eventsubscriptions');
    }
};
