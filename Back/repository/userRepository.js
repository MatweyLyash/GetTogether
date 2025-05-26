const models = require('../models');

class UserRepository {

    async getCategories() {
        return await models.Category.findAll({ where: { deletedAt: null } });
    }

    async getEvents() {
        return await models.Event.findAll();
    }

    async getEvent(event_id, user_id) {

        if (!user_id) {
            return await models.Event.findOne({
                where: { id: event_id },
                paranoid: false,
                include: [
                    {
                        model: models.Category,
                        as: 'category',
                        attributes: ['id', 'category_name'],
                        paranoid: false, // Включаем удалённые мероприятия
                    },
                    {
                        model: models.User,
                        as: 'creator',
                        attributes: ['id', 'login', 'telegram']
                    },
                    {
                        model: models.Review,
                        as: 'reviews',
                        attributes: ['id', 'rating', 'comment', 'createdAt'],
                        include: [
                            {
                                model: models.User,
                                as: 'reviewUser',
                                attributes: ['id', 'login']
                            }
                        ]
                    }
                ]
            });
        }
        else {
            try {
                const event = await models.Event.findOne({
                    where: { id: event_id },
                    paranoid: false, // Включаем удалённые мероприятия
                    include: [
                        { model: models.Category, as: 'category', attributes: ['id', 'category_name'], paranoid: false },
                        { model: models.User, as: 'creator', attributes: ['id', 'login', 'telegram'] },
                        { model: models.Review, as: 'reviews', attributes: ['id', 'rating', 'comment', 'createdAt'], include: [{ model: models.User, as: 'reviewUser', attributes: ['id', 'login'] }] }
                    ]
                });

                if (!event) {
                    throw new Error('Event not found');
                }

                // Проверяем регистрацию текущего пользователя
                const registration = await models.EventRegistration.findOne({
                    where: { event_id, user_id },
                    include: [{ model: models.Status, as: 'status', attributes: ['status_name'] }]
                });

                // Добавляем telegram_invite_link, если заявка одобрена
                let telegram_invite_link = null;
                if (registration && registration.status_id === 2) {
                    telegram_invite_link = registration.telegram_invite_link;
                }

                return {
                    event,
                    registration: registration ? {
                        status: registration.status_id,
                        telegram_invite_link
                    } : null
                };
            } catch (error) {
                console.error('Ошибка получения события:', error);
                throw error;
            }
        }
    }

    async createEventRegistration(user_id, event_id) {
        return await models.EventRegistration.create({ user_id, event_id, status_id: 1 });
    }

    async cancelEventRegistration(user_id, event_id) {
        const registration = await models.EventRegistration.findOne({
            where: { user_id, event_id, status_id: 1 } // Только pending
        });
        if (!registration) {
            throw new Error('Заявка не найдена или уже отклонена');
        }

        registration.status_id = 3; // Устанавливаем статус rejected
        registration.updatedAt = new Date();
        await registration.save();

        return registration;
    }

    async createReview(user_id, event_id, rating, comment) {

        const event = await models.Event.findByPk(event_id);
        if (!event) {
            throw new Error('Мероприятие не найдено');
        }

        // Проверяем, что пользователь имеет принятую заявку
        const registration = await models.EventRegistration.findOne({
            where: {
                user_id: user_id,
                event_id: event_id,
                status_id: 2 // Только принятые заявки
            }
        });
        if (!registration) {
            throw new Error('У пользователя нет принятой заявки на это мероприятие');
        }

        // Проверяем, что мероприятие не было удалено до даты проведения
        if (event.deletedAt && event.deletedAt < event.date) {
            throw new Error('Нельзя оставить отзыв на мероприятие, удалённое до даты проведения');
        }

        return await models.Review.create({ user_id, event_id, rating, comment });
    }

    async getReviews(event_id) {
        return await models.Review.findAll({ where: { event_id } });
    }

    async getOwnEventsRegistration(user_id) {
        return await models.EventRegistration.findAll({
            where: { user_id },
            include: {
                model: models.Event,
                as: 'Event',
                paranoid: false,
                include: [{
                    model: models.Review,
                    as: 'reviews',
                    attributes: ['id', 'rating', 'comment', 'createdAt'],
                    include: [{
                        model: models.User,
                        as: 'reviewUser',
                        attributes: ['id', 'login']
                    }]
                }]
            }
        });
    }

    async createOrganizerRequest(user_id) {
        return await models.OrganizerRequest.create({ user_id, status_id: 1 });
    }

    async getOwnOrganizerRequests(user_id) {
        return await models.OrganizerRequest.findAll({
            where: { user_id }
        });
    }

    async getMe(user_id) {
        return await models.User.findByPk(user_id, {
            attributes: ['id', 'login', 'telegram', 'role_id', 'createdAt'], // Выбираем нужные поля
        });
    }
}

module.exports.repository = new UserRepository();