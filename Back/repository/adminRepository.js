const models = require('../models');
const eventValidator = require('../services/eventValidator');

class AdminRepository {

    async getCategories() {
        return await models.Category.findAll();
    }
    async addCategory(category_name) {
        await models.Category.create(category_name, { returning: true });
    }
    async renameCategory(category_id, category_name) {
        await models.Category.update({ category_name: category_name }, { where: { id: category_id } })
    }
    async deleteCategory(category_id) {
        // Проверяем, существует ли категория
        const category = await models.Category.findByPk(category_id);
        if (!category) {
            throw new Error('Категория не найдена');
        }

        // Находим все события, связанные с категорией
        const events = await models.Event.findAll({
            where: { category_id: category_id },
            attributes: ['id']
        });
        const eventIds = events.map(event => event.id);

        // Обновляем неподтверждённые заявки (status_id = 1) до отклонённых (status_id = 3)
        await models.EventRegistration.update(
            { status_id: 3 },
            { where: { event_id: eventIds, status_id: 1 } }
        );

        // Помечаем события как удалённые
        await models.Event.update(
            { deletedAt: new Date() },
            { where: { category_id: category_id } }
        );

        // Помечаем категорию как удалённую
        await models.Category.update(
            { deletedAt: new Date() },
            { where: { id: category_id } }
        );
    }

    async getUsers() {
        return await models.User.findAll();
    }

    async userBan(user_id, isBan) {
        await models.User.update({ is_blocked: isBan }, { where: { id: user_id } })
    }

    async getOrganizerRequests() {
        return await models.OrganizerRequest.findAll({
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'login', 'telegram']
                },
            ]
        });
    }

    async organizerResponse(request_id, status_id) {
        await models.OrganizerRequest.update({ status_id: status_id }, { where: { id: request_id } })
    }

    async unassignOrganizer(user_id) {
        await models.User.update({ role_id: 1 }, { where: { id: user_id } })
    }

    async getEvents() {
        await models.Event.findAll()
    }

    async updateEvent(event_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, image, tags) {
        const updateData = {
            title,
            description,
            date,
            location,
            category_id,
            price,
            capacity,
            telegram_chat_link
        };
        if (image !== undefined) {
            updateData.image = image; // Обновляем изображение, если передано
        }

        const [updatedCount] = await models.Event.update(updateData, {
            where: { id: event_id }
        });

        if (tags && Array.isArray(tags)) {
            const event = await models.Event.findByPk(event_id);
            if (event) {
                await event.setTags(tags);
            }
        }

        return updatedCount;
    }

    async deleteEvent(event_id) {
        await models.Event.destroy({ where: { id: event_id } })
    }

}

module.exports.repository = new AdminRepository();