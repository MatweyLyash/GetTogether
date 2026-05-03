const models = require('../models');

class UserRepository {

    async getCategories() {
        return await models.Category.findAll({ where: { deletedAt: null } });
    }

    async getEvents(filters = {}) {
        const { tags } = filters;
        const { Sequelize } = models;
        const now = new Date();

        const include = [
            {
                model: models.Category,
                as: 'category',
                attributes: ['id', 'category_name']
            },
            {
                model: models.User,
                as: 'creator',
                attributes: ['id', 'login', 'telegram']
            },
            {
                model: models.Tag,
                as: 'tags',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            },
            {
                model: models.Promotion,
                as: 'promotions',
                where: {
                    is_paid: true,
                    status: 'active',
                    expires_at: { [Sequelize.Op.gt]: now },
                },
                required: false,
                attributes: ['id', 'type', 'expires_at'],
            }
        ];

        const query = {
            include,
            order: [
                [Sequelize.literal(`
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM promotions p 
                            WHERE p.event_id = "Event".id 
                            AND p.is_paid = true 
                            AND p.status = 'active' 
                            AND p.expires_at > NOW()
                        ) THEN 1 
                        ELSE 0 
                    END
                `), 'DESC'],
                [Sequelize.literal(`
                    COALESCE((
                        SELECT MAX(
                            CASE p.type 
                                WHEN 'premium' THEN 3 
                                WHEN 'repeat' THEN 2 
                                WHEN 'boost' THEN 1 
                                WHEN 'one_time' THEN 0.5 
                                ELSE 0 
                            END
                        ) FROM promotions p 
                        WHERE p.event_id = "Event".id 
                        AND p.is_paid = true 
                        AND p.status = 'active' 
                        AND p.expires_at > NOW()
                    ), 0)
                `), 'DESC'],
                ['createdAt', 'DESC'],
            ],
        };

        if (tags && Array.isArray(tags) && tags.length > 0) {
            include[2].where = { id: tags };
            include[2].required = true;
        }

        return await models.Event.findAll(query);
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
                        model: models.Tag,
                        as: 'tags',
                        attributes: ['id', 'name'],
                        through: { attributes: [] }
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
                        { model: models.Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } },
                        { model: models.User, as: 'creator', attributes: ['id', 'login', 'telegram'] },
                        { model: models.Review, as: 'reviews', attributes: ['id', 'rating', 'comment', 'createdAt'], include: [{ model: models.User, as: 'reviewUser', attributes: ['id', 'login'] }] }
                    ]
                });

                if (!event) {
                    return null;
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

                const waitlistItem = await models.EventWaitlist.findOne({
                    where: { event_id, user_id }
                });

                return {
                    event,
                    registration: registration ? {
                        id: registration.id,
                        status: registration.status_id,
                        telegram_invite_link,
                        qr_code_used: registration.status_id === 2 && !registration.qr_code
                    } : null,
                    waitlist: waitlistItem ? {
                        id: waitlistItem.id,
                        notification_method: waitlistItem.notification_method,
                        notified_at: waitlistItem.notified_at
                    } : null
                };
            } catch (error) {
                console.error('Ошибка получения события:', error);
                throw error;
            }
        }
    }

    async createEventRegistration(user_id, event_id) {
        const registration = await models.EventRegistration.create({ user_id, event_id, status_id: 1 });
        await models.EventWaitlist.destroy({ where: { user_id, event_id } });
        return registration;
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

        // Проверяем, что пользователь посетил мероприятие (QR-код был отсканирован)
        // Если qr_code не null, значит он ещё не был использован (отсканирован)
        if (registration.qr_code) {
            throw new Error('Вы не можете оставить отзыв, так как не посетили это мероприятие');
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
                include: [
                    {
                        model: models.Category,
                        as: 'category',
                        attributes: ['id', 'category_name'],
                        paranoid: false,
                    },
                    {
                        model: models.Review,
                        as: 'reviews',
                        attributes: ['id', 'rating', 'comment', 'createdAt'],
                        include: [{
                            model: models.User,
                            as: 'reviewUser',
                            attributes: ['id', 'login']
                        }]
                    }
                ]
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
