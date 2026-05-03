const EventViewRepository = require('../repository/eventViewRepository');

class EventViewController {
  constructor() {
    this.repository = EventViewRepository.repository;
    this.recordView = this.recordView.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async recordView(req, res) {
    try {
      const { event_id } = req.params;
      const user_id = req.user?.id || null;
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

      await this.repository.recordView(event_id, user_id, ip);
      res.status(201).json({ recorded: true });
    } catch (error) {
      console.error('Record view error:', error);
      res.status(500).json({ error: 'Не удалось зафиксировать просмотр' });
    }
  }

  async getStats(req, res) {
    try {
      const creator_id = req.user.id;
      const stats = await this.repository.getOrganizerStats(creator_id);
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Не удалось получить статистику' });
    }
  }
}

module.exports = new EventViewController();
