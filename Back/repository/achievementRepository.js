const models = require('../models');

class AchievementRepository {
    async list() {
        const items = await models.Achievement.findAll({ order: [['id', 'ASC']] });
        return items;
    }

    async get(id) {
        return await models.Achievement.findByPk(id);
    }

    async create(payload) {
        return await models.Achievement.create(payload);
    }

    async update(id, payload) {
        return await models.Achievement.update(payload, { where: { id } });
    }

    async delete(id) {
        return await models.Achievement.destroy({ where: { id } });
    }
}

module.exports.repository = new AchievementRepository();

