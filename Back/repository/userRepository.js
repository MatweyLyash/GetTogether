const models = require('./../models/relations');

class UserRepository {
    
    async getCategories() {
        return await models.Category.findAll();
    }

    async getEvents() {
        return await models.Event.findAll();
    }

    async getEvent(event_id) {
        return await models.Event.findOne({
            where: { id: event_id },
            include:[
                { model: models.Category,
                    attributes: ['id', 'category_name']
                 },
                { 
                    model: models.User,
                    attributes: ['id', 'login', 'telegram']
                }
            ]
        })
    }

    async createEventRegistration(user_id, event_id) {
        return await models.EventRegistration.create({user_id, event_id, status_id: 1});
    }

    async createReview(user_id, event_id, rating, text) {
        return await models.Review.create({user_id, event_id, rating, text});
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
        return await models.OrganizerRequest.create({user_id, status: 1});
    }

    async getOwnOrganizerRequests(user_id) {
        return await models.OrganizerRequest.findAll({
            where: { user_id }
        });
    }
}

module.exports.repository = new UserRepository();