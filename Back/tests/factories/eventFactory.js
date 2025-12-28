const models = require('../../models');

const createCategory = async (overrides = {}) => {
    return await models.Category.create({
        category_name: `Category ${Date.now()}`,
        ...overrides
    });
};

const createEvent = async (overrides = {}) => {
    if (!overrides.category_id) {
        const cat = await createCategory();
        overrides.category_id = cat.id;
    }
    if (!overrides.creator_id) {
        // We might want to import createUser but to avoid circular deps we just use models
        const user = await models.User.create({
            login: `organizer_${Date.now()}`,
            password_hash: 'hash',
            role_id: 2
        });
        overrides.creator_id = user.id;
    }

    return await models.Event.create({
        title: `Event ${Date.now()}`,
        description: 'Description',
        date: new Date(Date.now() + 86400000), // tomorrow
        location: 'Location',
        price: 0,
        capacity: 10,
        ...overrides
    }, { validate: false });
};

module.exports = {
    createCategory,
    createEvent
};
