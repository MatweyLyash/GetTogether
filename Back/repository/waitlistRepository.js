const models = require('../models');
const { Op } = require('sequelize');

class WaitlistRepository {
    async addToWaitlist(user_id, event_id, notification_method) {
        const event = await models.Event.findByPk(event_id);
        if (!event) {
            throw new Error('Мероприятие не найдено');
        }
        if (event.capacity > 0) {
            throw new Error('На мероприятии есть свободные места');
        }

        const registration = await models.EventRegistration.findOne({
            where: { user_id, event_id, status_id: { [Op.in]: [1, 2] } }
        });
        if (registration) {
            throw new Error('Вы уже отправили заявку на это мероприятие');
        }

        return await models.EventWaitlist.create({ user_id, event_id, notification_method });
    }

    async removeFromWaitlist(user_id, waitlist_id) {
        return await models.EventWaitlist.destroy({ where: { id: waitlist_id, user_id } });
    }

    async removeUserFromEventWaitlist(user_id, event_id) {
        return await models.EventWaitlist.destroy({ where: { user_id, event_id } });
    }

    async getUserWaitlist(user_id) {
        return await models.EventWaitlist.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: models.Event,
                    as: 'event',
                    paranoid: false,
                    include: [
                        { model: models.Category, as: 'category', attributes: ['id', 'category_name'], paranoid: false },
                        { model: models.Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } },
                        { model: models.User, as: 'creator', attributes: ['id', 'login', 'telegram'] }
                    ]
                }
            ]
        });
    }

    async getEventWaitlistSubscribers(event_id) {
        return await models.EventWaitlist.findAll({
            where: { event_id },
            include: [{ model: models.User, as: 'user' }]
        });
    }
}

module.exports = { repository: new WaitlistRepository() };
