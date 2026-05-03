const UserRepository = require('../repository/userRepository');
const validators = require('../services/baseValidators');
const qrCodeService = require('../services/qrCodeService');
const models = require('../models');
const achievementService = require('../services/achievementService');

// Конфигурация ID ачивок (при необходимости поменять через .env)
const ACHIEVEMENT_IDS = {
    APPLY: Number(process.env.ACHIEVEMENT_APPLY_ID || 1),
    ATTEND: Number(process.env.ACHIEVEMENT_ATTEND_ID || 2),
};
// Карта категорий: category_id -> achievement_id (JSON в ACHIEVEMENT_CATEGORY_MAP)
let CATEGORY_MAP = {};
try {
    CATEGORY_MAP = process.env.ACHIEVEMENT_CATEGORY_MAP ? JSON.parse(process.env.ACHIEVEMENT_CATEGORY_MAP) : {};
} catch (e) {
    CATEGORY_MAP = {};
}

class UserController {
    constructor() {
        this.userRepository = UserRepository.repository;

        this.getCategories = this.getCategories.bind(this);
        this.getEvents = this.getEvents.bind(this);
        this.getEvent = this.getEvent.bind(this);
        this.createEventRegistration = this.createEventRegistration.bind(this);
        this.createReview = this.createReview.bind(this);
        this.getReviews = this.getReviews.bind(this);
        this.getOwnEventsRegistration = this.getOwnEventsRegistration.bind(this);
        this.createOrganizerRequest = this.createOrganizerRequest.bind(this);
        this.getOwnOrganizerRequests = this.getOwnOrganizerRequests.bind(this);
        this.linkTelegram = this.linkTelegram.bind(this);
        this.cancelEventRegistration = this.cancelEventRegistration.bind(this);
        this.getMe = this.getMe.bind(this);
        this.getRegistrationQRCode = this.getRegistrationQRCode.bind(this);
    }

    async getCategories(req, res) {
        try {
            const categories = await this.userRepository.getCategories();
            return res.json(categories);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getEvents(req, res) {
        try {
            const { tags } = req.query;
            const filters = {};
            if (tags) {
                // Determine if tags is array or string (comma separated)
                // If it's `?tags=1&tags=2`, express typically makes it an array.
                // If `?tags=1,2`, it's a string.
                if (Array.isArray(tags)) {
                    filters.tags = tags.map(t => Number(t));
                } else {
                    // Try parsing as JSON or comma separated
                    try {
                        const parsed = JSON.parse(tags);
                        filters.tags = Array.isArray(parsed) ? parsed : [parsed];
                    } catch (e) {
                        filters.tags = tags.split(',').map(t => Number(t));
                    }
                }
            }

            const events = await this.userRepository.getEvents(filters);
            const eventsData = await Promise.all(
                events.map(async (event) => {
                    const plainEvent = typeof event.toJSON === 'function' ? event.toJSON() : event;

                    if (plainEvent.image) {
                        const { fileTypeFromBuffer } = await import('file-type');
                        const fileType = await fileTypeFromBuffer(plainEvent.image);
                        const mime = fileType?.mime || 'image/jpeg';
                        plainEvent.image = `data:${mime};base64,${plainEvent.image.toString('base64')}`;
                    }

                    return plainEvent;
                })
            );
            return res.json(eventsData);
        } catch (error) {
            console.error('Ошибка получения событий:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getEvent(req, res) {
        try {
            const { event_id } = req.params;
            const user_id = req.user?.id;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }

            const result = await this.userRepository.getEvent(event_id, user_id);
            if (!result) {
                return res.status(404).json({ error: 'Мероприятие не найдено' });
            }

            const rawEvent = result.event || result;
            const event = typeof rawEvent?.toJSON === 'function' ? rawEvent.toJSON() : rawEvent;

            if (event.image) {
                const { fileTypeFromBuffer } = await import('file-type');
                const fileType = await fileTypeFromBuffer(event.image);
                const mime = fileType?.mime || 'image/jpeg';
                event.image = `data:${mime};base64,${event.image.toString('base64')}`;
            }

            if (result.event) {
                return res.json({
                    ...result,
                    event,
                });
            }

            return res.json(event);
        } catch (error) {
            console.error('Ошибка получения события:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getReviews(req, res) {
        try {
            const { event_id } = req.params;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }

            const reviews = await this.userRepository.getReviews(event_id);
            return res.json(reviews);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createEventRegistration(req, res) {
        try {
            const { event_id } = req.body;
            const user_id = req.user.id;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }

            const registration = await this.userRepository.createEventRegistration(user_id, event_id);

            // Achievement: подал заявку (однократно на событие)
            try {
                await achievementService.processApply(user_id, event_id);
            } catch (e) {
                console.warn('Achievement APPLY error:', e.message);
            }

            return res.status(201).json(registration);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async cancelEventRegistration(req, res) {
        try {
            const { event_id } = req.params;
            const user_id = req.user.id;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }

            const registration = await this.userRepository.cancelEventRegistration(user_id, event_id);
            return res.status(200).json({ message: 'Заявка успешно отозвана', registration });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createReview(req, res) {
        try {
            const { event_id, rating, comment } = req.body;
            const user_id = req.user.id;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }

            if (!validators.validateRating(rating)) {
                return res.status(400).json({ error: 'Рейтинг должен быть числом от 1 до 5' });
            }

            if (!validators.validateText(comment)) {
                return res.status(400).json({ error: 'Комментарий должен быть от 1 до 255 символов' });
            }

            const registration = await models.EventRegistration.findOne({
                where: { user_id, event_id, status_id: 2 }
            });
            if (!registration) {
                return res.status(403).json({ error: 'Вы не были подтверждены на этом мероприятии' });
            }

            const event = await models.Event.findByPk(event_id);
            if (!event) {
                return res.status(404).json({ error: 'Мероприятие не найдено' });
            }
            if (new Date(event.date) > new Date()) {
                return res.status(400).json({ error: 'Оставлять отзыв можно только после завершения мероприятия' });
            }

            const existing = await models.Review.findOne({ where: { user_id, event_id } });
            if (existing) {
                return res.status(400).json({ error: 'Вы уже оставили отзыв на это мероприятие' });
            }

            const review = await this.userRepository.createReview(user_id, event_id, rating, comment);
            return res.status(201).json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    async getOwnEventsRegistration(req, res) {
        try {
            const user_id = req.user.id;
            const registrations = await this.userRepository.getOwnEventsRegistration(user_id);

            // Achievement: посещение прошедших мероприятий (для случаев, когда дата была изменена после сканирования QR)
            const now = new Date();
            const result = [];

            for (const reg of registrations) {
                const event = reg.Event;
                if (event) {
                    const isApproved = reg.status_id === 2;
                    const isPast = new Date(event.date) < now;
                    // Check if scanned (approved and qr_code is null)
                    // Note: reg.qr_code is from DB. If it's a buffer, it's truthy. If null, falsy.
                    const isScanned = isApproved && !reg.qr_code;

                    // Начисляем достижения, если QR был отсканирован и событие стало прошедшим
                    // processAttend использует metadataKey для предотвращения повторного начисления
                    if (isScanned && isPast) {
                        try {
                            await achievementService.processAttend(user_id, event);
                        } catch (e) {
                            console.warn('Achievement ATTEND error:', e.message);
                        }
                    }
                }

                // Prepare for response
                const regJSON = reg.toJSON();
                // Ensure qr_code is a simple truthy/falsy value for frontend simplicity
                // If it exists (Buffer), we can just replace it with a marker string to avoid sending binary data
                // If it is null, it stays null.
                if (regJSON.qr_code) {
                    regJSON.qr_code = 'QR_CODE_EXISTS';
                }

                result.push(regJSON);
            }

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Ачивки пользователя с прогрессом
    async getAchievementsProgress(req, res) {
        try {
            const user_id = req.user.id;
            const achievements = await models.Achievement.findAll({
                include: [
                    {
                        model: models.UserAchievement,
                        as: 'userAchievements',
                        where: { user_id },
                        required: false,
                    },
                ],
                order: [['id', 'ASC']],
            });

            const result = achievements.map((a) => {
                const ua = Array.isArray(a.userAchievements) && a.userAchievements.length > 0 ? a.userAchievements[0] : null;
                return {
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    score: a.score,
                    trigger: a.trigger,
                    condition_event_id: a.condition_event_id,
                    condition_category_id: a.condition_category_id,
                    condition_payload: a.condition_payload,
                    image: a.image,
                    progress: ua?.progress || 0,
                    is_unlocked: ua?.is_unlocked || false,
                    unlocked_at: ua?.unlocked_at || null,
                };
            });

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createOrganizerRequest(req, res) {
        try {
            const user_id = req.user.id; // Исправлено: req.user.userId → req.user.id
            console.log('Received user_id:', user_id); // Для отладки
            const request = await this.userRepository.createOrganizerRequest(user_id);
            return res.status(201).json(request);
        } catch (error) {
            console.error('Error in createOrganizerRequest:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getOwnOrganizerRequests(req, res) {
        try {
            const user_id = req.user.id;
            const requests = await this.userRepository.getOwnOrganizerRequests(user_id);
            return res.json(requests);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getMe(req, res) {
        try {
            const user_id = req.user.id;
            const user = await this.userRepository.getMe(user_id);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            return res.json(user);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async linkTelegram(req, res) {
        try {
            const { telegram } = req.body;
            const user_id = req.user.id;

            if (!telegram || !telegram.startsWith('@')) {
                return res.status(400).json({ error: 'Не верный тег Telegram' });
            }

            const user = await this.userRepository.getMe(user_id);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            const expectedTelegram = user.telegram?.startsWith('PENDING_')
                ? user.telegram.replace('PENDING_', '')
                : user.telegram;

            if (expectedTelegram !== telegram) {
                return res.status(400).json({ message: 'Указанный Telegram-тег не совпадает с ожидаемым' });
            }

            user.telegram = telegram;
            user.updatedAt = new Date();
            await user.save();

            res.status(200).json({ message: 'Telegram-тег успешно привязан', telegram });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getRegistrationQRCode(req, res) {
        try {
            const { registration_id } = req.params;
            const user_id = req.user.id;

            if (!validators.validatePresence(registration_id)) {
                return res.status(400).json({ error: 'ID регистрации обязательно' });
            }

            // Находим регистрацию с включённым событием
            const registration = await models.EventRegistration.findOne({
                where: {
                    id: registration_id,
                    user_id: user_id // Убеждаемся, что это регистрация текущего пользователя
                },
                include: [
                    {
                        model: models.Event,
                        as: 'Event',
                        attributes: ['id', 'title', 'date', 'location']
                    },
                    {
                        model: models.User,
                        as: 'user',
                        attributes: ['id', 'login']
                    }
                ]
            });

            if (!registration) {
                return res.status(404).json({ error: 'Регистрация не найдена' });
            }

            // Проверяем, что регистрация одобрена (status_id === 2)
            if (registration.status_id !== 2) {
                return res.status(403).json({
                    error: 'QR-код доступен только для подтверждённых регистраций',
                    currentStatus: registration.status_id
                });
            }

            // Возвращаем сохранённый QR-код из БД
            if (!registration.qr_code) {
                return res.status(404).json({
                    error: 'QR-код  был использован ранее.'
                });
            }

            // Преобразуем QR-код в base64 Data URL (как и для фото событий)
            const qrCodeBase64 = registration.qr_code.toString('base64');
            const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;

            return res.json({
                message: 'QR-код успешно получен',
                qrCode: qrCodeDataUrl,
                registration: {
                    id: registration.id,
                    eventTitle: registration.Event.title,
                    eventDate: registration.Event.date,
                    eventLocation: registration.Event.location,
                    status: 'Подтверждено'
                }
            });
        } catch (error) {
            console.error('Ошибка генерации QR-кода:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();