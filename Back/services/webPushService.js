const webpush = require('web-push');
const models = require('../models');

// VAPID ключи (должны быть в .env)
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

// Инициализация VAPID только если ключи установлены
let vapidInitialized = false;
if (vapidKeys.publicKey && vapidKeys.privateKey) {
    try {
        webpush.setVapidDetails(
            'mailto:gettogether@example.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );
        vapidInitialized = true;
    } catch (error) {
        console.warn('Предупреждение: Не удалось инициализировать VAPID ключи:', error.message);
    }
} else {
    console.warn('Предупреждение: VAPID ключи не установлены. Web Push уведомления будут недоступны.');
}

class WebPushService {
    // Сохранить push subscription
    async savePushSubscription(user_id, subscription) {
        const { endpoint, keys } = subscription;

        // Проверяем существует ли уже такая подписка
        const existing = await models.PushSubscription.findOne({ where: { endpoint } });
        if (existing) {
            // Обновляем user_id если нужно
            existing.user_id = user_id;
            await existing.save();
            return existing;
        }

        return await models.PushSubscription.create({
            user_id,
            endpoint,
            keys
        });
    }

    // Удалить push subscription
    async removePushSubscription(endpoint) {
        return await models.PushSubscription.destroy({ where: { endpoint } });
    }

    // Отправить уведомление конкретному пользователю
    async sendNotification(user_id, payload) {
        if (!vapidInitialized) {
            console.warn('Web Push уведомления отключены: VAPID ключи не установлены');
            return;
        }

        try {
            const subscriptions = await models.PushSubscription.findAll({ where: { user_id } });

            const notifications = subscriptions.map(sub => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: sub.keys
                };
                return webpush.sendNotification(pushSubscription, JSON.stringify(payload))
                    .catch(err => {
                        console.error('Push failed:', err);
                        // Удаляем невалидную подписку
                        if (err.statusCode === 410) {
                            this.removePushSubscription(sub.endpoint);
                        }
                    });
            });

            await Promise.all(notifications);
        } catch (error) {
            console.error('Error sending web push:', error);
        }
    }

    // Отправить уведомление о новом мероприятии
    async notifyNewEvent(user_id, event) {
        const payload = {
            title: '🎉 Новое мероприятие!',
            body: `${event.title} — ${new Date(event.date).toLocaleDateString('ru-RU')}`,
            icon: '/logo.png',
            badge: '/badge.png',
            data: {
                url: `/event/${event.id}`
            }
        };

        await this.sendNotification(user_id, payload);
    }

    // Получить публичный VAPID ключ
    getPublicKey() {
        if (!vapidInitialized) {
            return null;
        }
        return vapidKeys.publicKey;
    }
}

module.exports = new WebPushService();
