const WaitlistRepository = require('../repository/waitlistRepository');
const validators = require('../services/baseValidators');

class WaitlistController {
    constructor() {
        this.waitlistRepository = WaitlistRepository.repository;
        this.addToWaitlist = this.addToWaitlist.bind(this);
        this.removeFromWaitlist = this.removeFromWaitlist.bind(this);
        this.getUserWaitlist = this.getUserWaitlist.bind(this);
    }

    async addToWaitlist(req, res) {
        try {
            const { event_id, notification_method } = req.body;
            const user_id = req.user.id;

            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'ID мероприятия обязательно' });
            }
            if (!['telegram', 'browser'].includes(notification_method)) {
                return res.status(400).json({ error: 'Некорректный способ уведомления' });
            }

            const waitlistItem = await this.waitlistRepository.addToWaitlist(user_id, event_id, notification_method);
            return res.status(201).json(waitlistItem);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Мероприятие уже добавлено в список ожидания' });
            }
            if (['Мероприятие не найдено', 'На мероприятии есть свободные места', 'Вы уже отправили заявку на это мероприятие'].includes(error.message)) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    async removeFromWaitlist(req, res) {
        try {
            const { waitlist_id } = req.params;
            const user_id = req.user.id;

            const deleted = await this.waitlistRepository.removeFromWaitlist(user_id, waitlist_id);
            if (deleted === 0) {
                return res.status(404).json({ error: 'Запись в списке ожидания не найдена' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getUserWaitlist(req, res) {
        try {
            const waitlist = await this.waitlistRepository.getUserWaitlist(req.user.id);
            return res.json(waitlist);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new WaitlistController();
