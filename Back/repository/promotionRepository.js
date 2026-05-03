'use strict';

const models = require('../models');
const { Promotion, Event } = models;

const PRICES = {
  one_time: { byn: 2, usd_cents: 60, default_days: 1 },
  boost:    { byn: 5, usd_cents: 150, default_days: 3 },
  repeat:   { byn_per_day: 3, usd_cents_per_day: 90 },
  premium:  { byn_per_day: 5, usd_cents_per_day: 150 },
};

class PromotionRepository {

  static getPrices() {
    return PRICES;
  }

  static calcPrice(type, durationDays) {
    const p = PRICES[type];
    if (!p) return null;
    if (type === 'one_time') {
      return { amount_byn: p.byn, amount_usd_cents: p.usd_cents, duration_days: 1 };
    }
    if (type === 'boost') {
      return { amount_byn: p.byn, amount_usd_cents: p.usd_cents, duration_days: p.default_days };
    }
    const days = Math.max(1, Math.min(durationDays, type === 'repeat' ? 7 : 14));
    return {
      amount_byn: p.byn_per_day * days,
      amount_usd_cents: p.usd_cents_per_day * days,
      duration_days: days,
    };
  }

  async create(event_id, type, durationDays) {
    const calc = PromotionRepository.calcPrice(type, durationDays);
    if (!calc) throw new Error('Некорректный тип продвижения');

    return await Promotion.create({
      event_id,
      type,
      duration_days: calc.duration_days,
      amount_byn: calc.amount_byn,
      amount_usd_cents: calc.amount_usd_cents,
    });
  }

  async findBySessionId(sessionId) {
    return await Promotion.findOne({ where: { stripe_session_id: sessionId } });
  }

  async activate(promotionId, paymentIntentId) {
    const promo = await Promotion.findByPk(promotionId);
    if (!promo) throw new Error('Продвижение не найдено');

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + promo.duration_days);

    promo.is_paid = true;
    promo.status = 'active';
    promo.stripe_payment_intent_id = paymentIntentId;
    promo.starts_at = now;
    promo.expires_at = expiresAt;
    await promo.save();
    return promo;
  }

  async cancelBySessionId(sessionId) {
    const promo = await Promotion.findOne({ where: { stripe_session_id: sessionId } });
    if (!promo) return null;
    promo.status = 'cancelled';
    await promo.save();
    return promo;
  }

  async getActiveByEventId(eventId) {
    const now = new Date();
    return await Promotion.findOne({
      where: {
        event_id: eventId,
        is_paid: true,
        status: 'active',
        expires_at: { [models.Sequelize.Op.gt]: now },
      },
      order: [['amount_usd_cents', 'DESC']],
    });
  }

  async getOwnPromotions(creatorId) {
    const events = await Event.findAll({
      where: { creator_id: creatorId },
      attributes: ['id'],
    });
    const eventIds = events.map(e => e.id);

    return await Promotion.findAll({
      where: { event_id: eventIds },
      include: [{ model: Event, as: 'event', attributes: ['id', 'title'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async expireOld() {
    const now = new Date();
    return await Promotion.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          expires_at: { [models.Sequelize.Op.lt]: now },
        },
      }
    );
  }
}

module.exports.repository = new PromotionRepository();
module.exports.PRICES = PRICES;
