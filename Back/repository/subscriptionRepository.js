const models = require('../models');
const { Op } = require('sequelize');

class SubscriptionRepository {
    // Создать подписку
    async createSubscription(user_id, subscription_type, target_id, notification_method) {
        return await models.EventSubscription.create({
            user_id, subscription_type, target_id, notification_method
        });
    }

    // Удалить подписку
    async deleteSubscription(user_id, subscription_id) {
        return await models.EventSubscription.destroy({
            where: { id: subscription_id, user_id }
        });
    }

    // Получить все подписки пользователя
    async getSubscriptions(user_id) {
        return await models.EventSubscription.findAll({ where: { user_id } });
    }

    // Получить подписчиков для организатора или категории
    async getSubscribers(subscription_type, target_id) {
        return await models.EventSubscription.findAll({
            where: { subscription_type, target_id },
            include: [{ model: models.User, as: 'subscriber' }]
        });
    }
}

module.exports = { repository: new SubscriptionRepository() };
