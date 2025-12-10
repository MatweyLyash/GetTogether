const models = require('../models');

class AchievementService {
  /**
   * Добавить прогресс. Если указан metadataKey, повторное начисление с тем же ключом не произойдёт.
   */
  async addProgress(userId, achievementId, delta = 1, metadataKey = null) {
    const achievement = await models.Achievement.findByPk(achievementId);
    if (!achievement) throw new Error('Achievement not found');

    const [ua] = await models.UserAchievement.findOrCreate({
      where: { user_id: userId, achievement_id: achievementId },
      defaults: {
        progress: 0,
        is_unlocked: false,
        unlocked_at: null,
        metadata: { processedKeys: [] },
      },
    });

    // Проверяем metadataKey, если уже начисляли — выходим
    if (metadataKey) {
      const processed = Array.isArray(ua.metadata?.processedKeys) ? ua.metadata.processedKeys : [];
      if (processed.includes(metadataKey)) {
        return ua;
      }
      ua.metadata = { processedKeys: Array.from(new Set([...processed, metadataKey])) };
    }

    // Если уже открыто — выходим
    if (ua.is_unlocked) return ua;

    ua.progress = Math.min(achievement.score, (ua.progress || 0) + delta);
    if (ua.progress >= achievement.score) {
      ua.is_unlocked = true;
      ua.unlocked_at = new Date();
    }
    await ua.save();
    return ua;
  }

  /**
   * Начисления по событию "подача заявки".
   * Учитывает trigger='apply' и condition_event_id (если указано).
   */
  async processApply(userId, eventId) {
    const list = await models.Achievement.findAll({
      where: { trigger: 'apply' },
    });
    for (const a of list) {
      if (a.condition_event_id && Number(a.condition_event_id) !== Number(eventId)) continue;
      await this.addProgress(userId, a.id, 1, `apply:${eventId}:${a.id}`);
    }
  }

  /**
   * Начисления по событию "посещение" (подтверждён + дата в прошлом).
   * Учитывает:
   * - trigger='attend' с условием event_id (опционально)
   * - trigger='category' с условием category_id (опционально)
   */
  async processAttend(userId, event) {
    const list = await models.Achievement.findAll({
      where: { trigger: ['attend', 'category'] },
    });
    for (const a of list) {
      if (a.trigger === 'attend') {
        if (a.condition_event_id && Number(a.condition_event_id) !== Number(event.id)) continue;
        await this.addProgress(userId, a.id, 1, `attend:${event.id}:${a.id}`);
      } else if (a.trigger === 'category') {
        if (a.condition_category_id && Number(a.condition_category_id) !== Number(event.category_id)) continue;
        await this.addProgress(userId, a.id, 1, `attendcat:${event.id}:${a.id}`);
      }
    }
  }
}

module.exports = new AchievementService();

