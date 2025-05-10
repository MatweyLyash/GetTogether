const UserRepository = require('../repository/userRepository');
const validators = require('../services/baseValidators');

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
          const events = await this.userRepository.getEvents();
          const eventsData = await Promise.all(
            events.map(async (event) => {
              if (event.image) {
                const { fileTypeFromBuffer } = await import('file-type');
                const fileType = await fileTypeFromBuffer(event.image);
                const mime = fileType?.mime || 'image/jpeg';
                event.image = `data:${mime};base64,${event.image.toString('base64')}`;
              }
              return event;
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
          const user_id = req.user.id;
    
          if (!validators.validatePresence(event_id)) {
            return res.status(400).json({ error: 'Event ID is required' });
          }
    
          const event = await this.userRepository.getEvent(event_id, user_id);
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }
    
          if (event.event.image) {
            const { fileTypeFromBuffer } = await import('file-type');
            const fileType = await fileTypeFromBuffer(event.event.image);
            const mime = fileType?.mime || 'image/jpeg';
            event.event.image = `data:${mime};base64,${event.event.image.toString('base64')}`;
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
                return res.status(400).json({ error: 'Event ID is required' });
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
            const user_id = req.user.id; // Исправлено: req.user.userId → req.user.id

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'Event ID is required' });
            }

            const registration = await this.userRepository.createEventRegistration(user_id, event_id);
            return res.status(201).json(registration);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createReview(req, res) {
        try {
            const { event_id, rating, comment } = req.body;
            const user_id = req.user.id; // Исправлено: req.user.userId → req.user.id

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'Event ID is required' });
            }

            if (!validators.validateRating(rating)) {
                return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
            }

            if (!validators.validateText(comment)) {
                return res.status(400).json({ error: 'Comment must be between 1 and 255 characters' });
            }

            const registration = await models.EventRegistration.findOne({
                where: { user_id, event_id, status_id: 2 }
            });
            if (!registration) {
                return res.status(403).json({ error: 'Вы не были подтверждены на этом мероприятии' });
            }

            // 2. Проверка, что мероприятие уже прошло
            const event = await models.Event.findByPk(event_id);
            if (!event) {
                return res.status(404).json({ error: 'Мероприятие не найдено' });
            }
            if (new Date(event.date) > new Date()) {
                return res.status(400).json({ error: 'Оставлять отзыв можно только после завершения мероприятия' });
            }

            // 3. Проверка, что отзыв уже не оставлен
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
            const user_id = req.user.id; // Исправлено: req.user.userId → req.user.id
            const registrations = await this.userRepository.getOwnEventsRegistration(user_id);
            return res.json(registrations);
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
            const user_id = req.user.id; // Исправлено: req.user.userId → req.user.id
            const requests = await this.userRepository.getOwnOrganizerRequests(user_id);
            return res.json(requests);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async linkTelegram(req, res) {
        try {
            const { telegram } = req.body;
            const user_id = req.user.id; // Предполагаем аутентификацию

            // Валидация
            if (!telegram || !telegram.startsWith('@')) {
                return res.status(400).json({ error: 'Telegram tag is required' });
            }

            // Находим пользователя
            const user = await models.User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Проверяем, не занят ли тег
            const existingUser = await models.User.findOne({ where: { telegram } });
            if (existingUser && existingUser.id !== user_id) {
                return res.status(400).json({ error: 'Telegram tag already linked to another account' });
            }

            // Проверяем, прошло ли 2 минуты с updated_at
            const now = new Date();
            const updatedAt = new Date(user.updated_at);
            const timeDiff = (now - updatedAt) / 1000; // Разница в секундах

            if (timeDiff > 120) {
                user.telegram = null; // Сбрасываем, если прошло больше 2 минут
                return res.json({ message: 'linked account time out' });
            } else {
                user.telegram = telegram; // Устанавливаем переданный тег
            }
            // Сохраняем изменения  

            await user.save();

            return res.json({ message: 'Telegram account successfully linked', telegram });
        } catch (error) {
            console.error('Ошибка привязки Telegram:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new UserController();