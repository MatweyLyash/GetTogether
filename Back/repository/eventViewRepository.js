const models = require('../models');
const crypto = require('crypto');

class EventViewRepository {
  async recordView(event_id, user_id, ip) {
    const ip_hash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 64) : null;
    return await models.EventView.create({ event_id, user_id: user_id || null, ip_hash });
  }

  async getOrganizerStats(creator_id) {
    const { Sequelize } = models;

    const events = await models.Event.findAll({
      where: { creator_id },
      attributes: ['id', 'title', 'date'],
      include: [
        { model: models.Category, as: 'category', attributes: ['id', 'category_name'] },
      ],
      paranoid: false,
    });

    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) {
      return {
        events: [],
        viewsByDay: [],
        totals: { views: 0, uniqueViews: 0, registrations: 0, conversion: 0 },
      };
    }

    const viewsByEvent = await models.EventView.findAll({
      where: { event_id: { [Sequelize.Op.in]: eventIds } },
      attributes: [
        'event_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_views'],
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT ip_hash')), 'unique_views'],
      ],
      group: ['event_id'],
      raw: true,
    });

    const registrationsByEvent = await models.EventRegistration.findAll({
      include: [
        { model: models.Event, as: 'Event', where: { creator_id }, attributes: [] },
      ],
      attributes: [
        'event_id',
        [Sequelize.fn('COUNT', Sequelize.col('EventRegistration.id')), 'total_registrations'],
      ],
      group: ['event_id'],
      raw: true,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsByDay = await models.EventView.findAll({
      where: {
        event_id: { [Sequelize.Op.in]: eventIds },
        viewed_at: { [Sequelize.Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('viewed_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'views'],
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT ip_hash')), 'unique_views'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('viewed_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('viewed_at')), 'ASC']],
      raw: true,
    });

    const viewsMap = new Map(viewsByEvent.map((v) => [v.event_id, v]));
    const regsMap = new Map(registrationsByEvent.map((r) => [r.event_id, r]));

    const eventStats = events.map((event) => {
      const views = viewsMap.get(event.id);
      const regs = regsMap.get(event.id);
      const totalViews = Number(views?.total_views || 0);
      const uniqueViews = Number(views?.unique_views || 0);
      const totalRegs = Number(regs?.total_registrations || 0);

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        category: event.category?.category_name || null,
        total_views: totalViews,
        unique_views: uniqueViews,
        registrations: totalRegs,
        conversion: totalViews > 0 ? Math.round((totalRegs / totalViews) * 10000) / 100 : 0,
      };
    });

    const totalViews = eventStats.reduce((s, e) => s + e.total_views, 0);
    const totalUniqueViews = eventStats.reduce((s, e) => s + e.unique_views, 0);
    const totalRegs = eventStats.reduce((s, e) => s + e.registrations, 0);

    return {
      events: eventStats,
      viewsByDay: viewsByDay.map((d) => ({
        date: d.date,
        views: Number(d.views),
        unique_views: Number(d.unique_views),
      })),
      totals: {
        views: totalViews,
        uniqueViews: totalUniqueViews,
        registrations: totalRegs,
        conversion: totalViews > 0 ? Math.round((totalRegs / totalViews) * 10000) / 100 : 0,
      },
    };
  }
}

module.exports.repository = new EventViewRepository();
