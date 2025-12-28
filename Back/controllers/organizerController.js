const OrganizerRepository = require('./../repository/organizerRepository');
const validators = require('../services/baseValidators');
const eventValidator = require('../services/eventValidator');
const { v4: uuidv4 } = require('uuid');
const notificationService = require('../services/notificationService');


class OrganizerController {
    constructor() {
        this.organizerRepository = OrganizerRepository.repository;

        this.createEvent = this.createEvent.bind(this);
        this.getOwnEvents = this.getOwnEvents.bind(this);
        this.getOwnEvent = this.getOwnEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.responseToEventRequest = this.responseToEventRequest.bind(this);
        this.getEventRequests = this.getEventRequests.bind(this);
        this.verifyEventRegistration = this.verifyEventRegistration.bind(this);
    }

    async createEvent(req, res) {
        try {
            const { title, description, date, location, category_id, price, capacity, telegram_chat_link, tags } = req.body;
            const creator_id = req.user.id;
            const image = req.file?.buffer; // Двоичные данные изображения

            let parsedTags = [];
            if (tags) {
                try {
                    // If it comes as a JSON string (common in multipart)
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                } catch (e) {
                    console.warn('Error parsing tags:', e);
                }
            }

            const validation = eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity
            });

            if (!validation.valid) {
                return res.status(400).json({ error: validation.errors.join(', ') });
            }
            const organizer_verification_key = uuidv4();

            const event = await this.organizerRepository.createEvent(creator_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, organizer_verification_key, image, parsedTags);

            if (event.image) {
                const { getMimeType } = require('../utils/fileUtils');
                const mime = await getMimeType(event.image);
                event.dataValues.image = `data:${mime};base64,${event.image.toString('base64')}`;
            }

            // Уведомить подписчиков о новом мероприятии
            await notificationService.notifyNewEvent(event);

            res.status(201).json({
                event,
                message: `Событие создано. Добавьте бота @GetTogetherPSKPbot в группу как администратора и отправьте в группе: /verify ${organizer_verification_key}`
            });
        } catch (error) {
            console.error('Create event error:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ error: 'Ошибка валидации данных: ' + error.errors.map(e => e.message).join(', ') });
            }
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'Такое событие уже существует' });
            }
            return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + error.message, stack: error.stack });
        }
    }

    async getOwnEvents(req, res) {
        try {
            const creater_id = req.user.id
            const events = await this.organizerRepository.getOwnEvents(creater_id);

            for (const event of events) {
                if (event.image) {
                    const { getMimeType } = require('../utils/fileUtils');
                    const mime = await getMimeType(event.image);
                    event.dataValues.image = `data:${mime};base64,${event.image.toString('base64')}`;
                }
            }

            return res.json(events);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getOwnEvent(req, res) {
        try {
            const { event_id } = req.params;
            const creater_id = req.user.id
            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }

            const event = await this.organizerRepository.getOwnEvent(creater_id, event_id);
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            if (event.image) {
                const { getMimeType } = require('../utils/fileUtils');
                const mime = await getMimeType(event.image);
                event.dataValues.image = `data:${mime};base64,${event.image.toString('base64')}`;
            }

            return res.json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateEvent(req, res) {
        try {
            const { title, description, date, location, category_id, price, capacity, telegram_chat_link, tags } = req.body;
            const { event_id } = req.params;
            const creator_id = req.user.id;
            const image = req.file?.buffer;

            let parsedTags = undefined;
            if (tags !== undefined) {
                // only parse if provided
                try {
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                } catch (e) {
                    console.warn('Error parsing tags:', e);
                }
            }

            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Некорректный ID мероприятия' });
            }

            const validation = eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity, telegram_chat_link
            });

            if (!validation.valid) {
                return res.status(400).json({ error: validation.errors.join(', ') });
            }

            const event = await this.organizerRepository.updateEvent(creator_id, event_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, image, parsedTags);

            if (event == 1) {
                const updatedEvent = await this.organizerRepository.getOwnEvent(creator_id, event_id);
                if (updatedEvent.image) {
                    const { getMimeType } = require('../utils/fileUtils');
                    const mime = await getMimeType(updatedEvent.image);
                    updatedEvent.dataValues.image = `data:${mime};base64,${updatedEvent.image.toString('base64')}`;
                }
                return res.json({ message: 'Мероприятие обновлено', event: updatedEvent });
            }
            return res.status(404).json({ error: "Мероприятие не найдено", event });
        } catch (error) {
            console.error('Update event error:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ error: 'Ошибка валидации данных: ' + error.errors.map(e => e.message).join(', ') });
            }
            return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + error.message });
        }
    }

    async deleteEvent(req, res) {
        try {
            const { event_id } = req.params;
            const creator_id = req.user.id;


            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }

            await this.organizerRepository.deleteEvent(creator_id, event_id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async responseToEventRequest(req, res) {
        try {
            const { user_id, status_id } = req.body;
            const { event_id } = req.params;
            const creator_id = req.user.id;

            if (!eventValidator.validateId(event_id) || !eventValidator.validateId(user_id) || !validators.validatePresence(status_id)) {
                return res.status(400).json({ error: 'Event ID, User ID, and Status ID are required and must be valid' });
            }

            const response = await this.organizerRepository.responseToEventRequest(creator_id, user_id, event_id, status_id);
            return res.json(response);
        } catch (error) {
            if (error.message === 'Event not found or not owned by organizer' || error.message === 'Registration not found') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    async getEventRequests(req, res) {
        try {
            const { event_id } = req.params;
            const creator_id = req.user.id;

            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }

            const requests = await this.organizerRepository.getEventRequests(creator_id, event_id);
            return res.json(requests);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async verifyEventRegistration(req, res) {
        try {
            const { qrData } = req.body;
            const creator_id = req.user.id;

            if (!qrData) {
                return res.status(400).json({ error: 'QR Data is required' });
            }

            let parsedData;
            try {
                parsedData = JSON.parse(qrData);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid QR Data format' });
            }

            const { registrationId, eventId, userId } = parsedData;

            if (!registrationId || !eventId || !userId) {
                return res.status(400).json({ error: 'Incomplete QR Data' });
            }

            const result = await this.organizerRepository.verifyRegistration(creator_id, registrationId, eventId, userId);
            return res.json(result);

        } catch (error) {
            if (error.message === 'Событие не найдено или вы не являетесь его организатором' ||
                error.message === 'Регистрация не найдена' ||
                error.message === 'Регистрация не подтверждена') {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrganizerController();
