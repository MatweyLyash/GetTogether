const models = require('./../models/relations');

class OrganizerRepository {
    async createEvent(creator_id, title, description, date, location, category_id, price, capacity, telegramGroup) {
        return await models.Event.create({creator_id, title, description, date, location, category_id, price, capacity, telegramGroup});
    }

    async getOwnEvents(creator_id) {
        return await models.Event.findAll({
            where: { creator_id },
            include: {
                model: models.Category,
                as: 'category', // Указываем псевдоним, заданный в belongsTo
                attributes: ['id', 'category_name']
            }
        });
    }

    async getOwnEvent(creator_id, event_id) {
        return await models.Event.findOne({
            where: { creator_id:creator_id, id: event_id },
            include: {
                model: models.Category,
                as: 'category', // Указываем псевдоним, заданный в belongsTo
                attributes: ['id', 'category_name']
            }
        });
    }

    async updateEvent(creator_id, event_id, title, description, date, location, category_id, price, capacity, telegramGroup) {
        return await models.Event.update({title, description, date, location, category_id, price, capacity, telegramGroup}, {where:{creator_id, id:event_id}});
    }

    async deleteEvent(creator_id, event_id) {
        return await models.Event.destroy({where:{creator_id, id:event_id}});
    }

    async responseToEventRequest(creator_id, user_id, event_id, status_id) {
        const event = await models.Event.findOne({ where: { id: event_id, creator_id } });
        if (!event) {
            throw new Error('Event not found or not owned by organizer');
        }
    
        const [updatedCount] = await models.EventRegistration.update(
            { status_id },
            { where: { user_id, event_id } }
        );
    
        if (updatedCount === 0) {
            throw new Error('Registration not found');
        }
    
        return await models.EventRegistration.findOne({ where: { user_id, event_id } });
    }

    async getEventRequests(creator_id, event_id) {
        return await models.EventRegistration.findAll({
            where: { event_id },
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'login', 'telegram', 'created_at']
                },
                {
                    model: models.Event,
                    as: 'event',
                    where: { creator_id }, // Проверяем, что событие принадлежит организатору
                    attributes: []
                }
            ]
        });
    }
}

module.exports.repository = new OrganizerRepository();