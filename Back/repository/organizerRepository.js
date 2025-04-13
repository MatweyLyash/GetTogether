const models = require('./../models/relations');

class OrganizerRepository {
    async createEvent(user_id, title, description, date, location, category_id, price, capacity) {
        return await models.Event.create({user_id, title, description, date, location, category_id, price, capacity});
    }

    async getOwnEvents(user_id) {
        return await models.Event.findAll({
            where: { user_id },
            include: {
                model: models.Category,
                attributes: ['id', 'category_name']
            }
        });
    }

    async getOwnEvent(event_id) {
        return await models.Event.findOne({
            where: { id: event_id },
            include: {
                model: models.Category,
                attributes: ['id', 'category_name']
            }
        });
    }

    async updateEvent(event_id, title, description, date, location, category_id, price, capacity) {
        return await models.Event.update({title, description, date, location, category_id, price, capacity}, {where:{id:event_id}});
    }

    async deleteEvent(event_id) {
        return await models.Event.destroy({where:{id:event_id}});
    }

    async responseToEventRequest(user_id, event_id, status_id) {
        return await models.EventRegistration.update({status_id}, {where:{user_id, event_id}});
    }

}

module.exports.repository = new OrganizerRepository();