const SubscriptionRepository = require('../repository/subscriptionRepository');
const models = require('../models');
const webPushService = require('./webPushService');

class NotificationService {
    constructor() {
        this.subscriptionRepository = SubscriptionRepository.repository;
    }

    async notifyNewEvent(event) {
        try {
            // Приводим ID к числу для корректного поиска в БД
            const creatorId = typeof event.creator_id === 'string' ? parseInt(event.creator_id, 10) : event.creator_id;
            const categoryId = typeof event.category_id === 'string' ? parseInt(event.category_id, 10) : event.category_id;

            // Получаем подписчиков на организатора
            const organizerSubscribers = await this.subscriptionRepository.getSubscribers('organizer', creatorId);

            // Получаем подписчиков на категорию
            const categorySubscribers = await this.subscriptionRepository.getSubscribers('category', categoryId);

            // Объединяем и убираем дубликаты
            const allSubscribers = [...organizerSubscribers, ...categorySubscribers];
            const uniqueSubscribers = allSubscribers.filter(
                (sub, index, self) => index === self.findIndex(s => s.user_id === sub.user_id && s.notification_method === sub.notification_method)
            );

            console.log(`Найдено подписчиков для уведомления: ${uniqueSubscribers.length} (организатор: ${organizerSubscribers.length}, категория: ${categorySubscribers.length})`);

            for (const subscription of uniqueSubscribers) {
                // Проверяем, что subscriber загружен
                if (!subscription.subscriber) {
                    console.warn(`Subscriber не найден для подписки ${subscription.id}`);
                    continue;
                }

                if (subscription.notification_method === 'telegram') {
                    await this.sendTelegramNotification(subscription.subscriber, event);
                } else if (subscription.notification_method === 'browser') {
                    await this.storeBrowserNotification(subscription.subscriber, event);
                }
            }
        } catch (error) {
            console.error('Error notifying subscribers:', error);
        }
    }

    async sendTelegramNotification(user, event) {
        if (!user.telegram) {
            console.warn(`Пользователь ${user.id} не имеет привязанного Telegram`);
            return;
        }

        // Используем функцию из telegramBot.js для отправки уведомлений
        const { sendNotificationToUser } = require('../bot/telegramBot');

        const message = `🎉 Новое мероприятие!\n\n📌 ${event.title}\n📅 ${new Date(event.date).toLocaleDateString('ru-RU')}\n📍 ${event.location}\n\nПодробнее на сайте!`;

        // Отправка через username (user.telegram содержит @username)
        const success = await sendNotificationToUser(user.telegram, message);
        if (!success) {
            console.warn(`Не удалось отправить уведомление пользователю ${user.telegram}`);
        }
    }

    async storeBrowserNotification(user, event) {
        // Отправка через Web Push API
        // Приводим user.id к числу, если это строка
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        await webPushService.notifyNewEvent(userId, event);
    }
}

module.exports = new NotificationService();
