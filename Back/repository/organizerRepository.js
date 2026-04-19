const models = require('../models');
const { generateInviteLink } = require('../bot/telegramBot');
const qrCodeService = require('../services/qrCodeService');
const achievementService = require('../services/achievementService');

class OrganizerRepository {
    async createEvent(creator_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, organizer_verification_key, image, tags, latitude, longitude) {
        const category = await models.Category.findOne({
            where: { id: category_id, deletedAt: null }
        });
        if (!category) {
            throw new Error('Категория не найдена или удалена');
        }

        const event = await models.Event.create({ creator_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, organizer_verification_key, image, latitude, longitude });

        if (tags && Array.isArray(tags) && tags.length > 0) {
            await event.setTags(tags);
        }

        return event;
    }

    async getOwnEvents(creator_id) {
        return await models.Event.findAll({
            where: { creator_id },
            include: [
                {
                    model: models.Category,
                    as: 'category', // Указываем псевдоним, заданный в belongsTo
                    attributes: ['id', 'category_name']
                },
                {
                    model: models.Tag,
                    as: 'tags',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
    }

    async getOwnEvent(creator_id, event_id) {
        return await models.Event.findOne({
            where: { creator_id: creator_id, id: event_id },
            include: [
                {
                    model: models.Category,
                    as: 'category', // Указываем псевдоним, заданный в belongsTo
                    attributes: ['id', 'category_name']
                },
                {
                    model: models.Tag,
                    as: 'tags',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
    }

    async updateEvent(creator_id, event_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, image, tags, latitude, longitude) {
        const updateData = {
            title,
            description,
            date,
            location,
            category_id,
            price,
            capacity,
            telegram_chat_link,
            latitude,
            longitude
        };
        if (image !== undefined) {
            updateData.image = image; // Обновляем изображение, если передано
        }

        const [updatedCount] = await models.Event.update(updateData, {
            where: { creator_id, id: event_id }
        });

        if (tags && Array.isArray(tags)) {
            const event = await models.Event.findOne({ where: { id: event_id, creator_id } });
            if (event) {
                await event.setTags(tags);
            }
        }

        return updatedCount;
    }

    async deleteEvent(creator_id, event_id) {
        return await models.Event.destroy({ where: { creator_id, id: event_id } });
    }

    async responseToEventRequest(creator_id, user_id, event_id, status_id) {
        const event = await models.Event.findOne({ where: { id: event_id, creator_id: creator_id } });
        if (!event) {
            throw new Error('Событие не найдено или у него нет организатора');
        }

        const registration = await models.EventRegistration.findOne({
            where: { user_id, event_id },
        });

        // Проверяем, есть ли свободные места при одобрении заявки
        if (status_id === 2 && event.capacity === 0) {
            throw new Error('Нет свободных мест');
        }

        registration.status_id = status_id;

        // Если статус "approved", генерируем одноразовую ссылку
        if (status_id === 2) {
            if (!event.telegram_chat_id) {
                throw new Error('Телаграмм беседа не привязана');
            }

            const inviteResult = await generateInviteLink(event_id, user_id);
            if (!inviteResult.success) {
                throw new Error(`Ошибка генерации ключа: ${inviteResult.message}`);
            }

            registration.telegram_invite_link = inviteResult.inviteLink;

            // Генерируем QR-код для подтверждённой регистрации
            const qrCodeBuffer = await qrCodeService.generateRegistrationQRCodeBuffer({
                registrationId: registration.id,
                eventId: event_id,
                userId: user_id,
                eventTitle: event.title
            });
            registration.qr_code = qrCodeBuffer;
        }

        // Сохраняем изменения
        await registration.save();

        // Возвращаем обновлённую заявку с включённым статусом
        return await models.EventRegistration.findOne({
            where: { user_id, event_id },
            include: [{ model: models.Status, as: 'status', attributes: ['status_name'] }],
        });
    }

    async getEventRequests(creator_id, event_id) {
        return await models.EventRegistration.findAll({
            where: { event_id },
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'login', 'telegram', 'createdAt']
                },
                {
                    model: models.Event,
                    as: 'Event',
                    where: { creator_id }, // Проверяем, что событие принадлежит организатору
                    attributes: []
                }
            ]
        });
    }

    async verifyRegistration(creator_id, registration_id, event_id, user_id) {
        // 1. Проверяем, что событие принадлежит организатору
        const event = await models.Event.findOne({ where: { id: event_id, creator_id: creator_id } });
        if (!event) {
            throw new Error('Событие не найдено или вы не являетесь его организатором');
        }

        // 2. Ищем регистрацию
        const registration = await models.EventRegistration.findOne({
            where: { id: registration_id, event_id, user_id },
            include: [
                { model: models.User, as: 'user', attributes: ['login'] },
                { model: models.Event, as: 'Event', attributes: ['title', 'date'] }
            ]
        });

        if (!registration) {
            throw new Error('Регистрация не найдена');
        }

        // 3. Проверяем статус
        if (registration.status_id !== 2) {
            throw new Error('Регистрация не подтверждена');
        }

        // 4. Проверяем, что QR-код ещё не был использован
        if (registration.qr_code === null || registration.qr_code === '') {
            throw new Error('QR-код уже был использован');
        }

        // 5. Очищаем QR-код (делаем его одноразовым)
        registration.qr_code = null;
        await registration.save();

        // 6. Начисляем достижения за посещение (только если событие уже прошло)
        const now = new Date();
        const eventDate = new Date(registration.Event.date);
        if (eventDate < now) {
            try {
                await achievementService.processAttend(user_id, event);
            } catch (e) {
                console.warn('Achievement ATTEND error:', e.message);
            }
        }

        return {
            valid: true,
            user: registration.user.login,
            event: registration.Event.title,
            date: registration.Event.date,
            status: 'Подтверждено'
        };
    }
}

module.exports.repository = new OrganizerRepository();