const models = require('./../models/relations');

class UserRepository {
    
    async getCategories() {
        return await models.Category.findAll();
    }

    async getEvents() {
        return await models.Event.findAll();
    }

    async getEvent(event_id, user_id) {

        if(!user_id) {
            return await models.Event.findOne({
                where: { id: event_id },
                include: [
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
                    model: models.Review,
                    as: 'reviews',
                    attributes: ['id', 'rating', 'comment', 'created_at'],
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
                  include: [
                    { model: models.Category, as: 'category', attributes: ['id', 'category_name'] },
                    { model: models.User, as: 'creator', attributes: ['id', 'login', 'telegram'] },
                    { model: models.Review, as: 'reviews', attributes: ['id', 'rating', 'comment', 'created_at'], include: [{ model: models.User, as: 'reviewUser', attributes: ['id', 'login'] }] }
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
        return await models.EventRegistration.create({user_id, event_id, status_id: 1});
    }

    async createReview(user_id, event_id, rating, comment) {
        return await models.Review.create({user_id, event_id, rating, comment});
    }

    async getReviews(event_id) {
        return await models.Review.findAll({where:{event_id}});
    }

    async getOwnEventsRegistration(user_id) {
        return await models.EventRegistration.findAll({
            where: { user_id},
            include: {
                model: models.Event,
            },
        });
    }

    async createOrganizerRequest(user_id) {
        return await models.OrganizerRequest.create({user_id, status_id: 1});
    }

    async getOwnOrganizerRequests(user_id) {
        return await models.OrganizerRequest.findAll({
            where: { user_id }
        });
    }
}

module.exports.repository = new UserRepository();