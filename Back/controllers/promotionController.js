'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { repository: PromotionRepo, PRICES } = require('../repository/promotionRepository');
const models = require('../models');
const { Promotion, Event } = models;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const TYPE_LABELS = {
  one_time: 'Единоразовый подъём',
  boost: 'Повышение (3 дня)',
  repeat: 'Повтор',
  premium: 'Премиум',
};

class PromotionController {

  async checkout(req, res) {
    try {
      const { event_id, type, duration_days } = req.body;
      const creator_id = req.user.id;

      if (!event_id || !type) {
        return res.status(400).json({ error: 'event_id и type обязательны' });
      }

      const event = await Event.findOne({ where: { id: event_id, creator_id } });
      if (!event) {
        return res.status(403).json({ error: 'Мероприятие не найдено или нет доступа' });
      }

      if (!PRICES[type]) {
        return res.status(400).json({ error: 'Некорректный тип продвижения' });
      }

      const days = duration_days || (type === 'boost' ? 3 : type === 'one_time' ? 1 : 1);
      const promo = await PromotionRepo.create(event_id, type, days);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Продвижение: ${TYPE_LABELS[type]}`,
                description: `Мероприятие: ${event.title}. Длительность: ${promo.duration_days} дн.`,
              },
              unit_amount: promo.amount_usd_cents,
            },
            quantity: 1,
          },
        ],
        success_url: `${FRONTEND_URL}/cabinet?promotion=success`,
        cancel_url: `${FRONTEND_URL}/cabinet?promotion=cancel`,
        metadata: {
          promotion_id: String(promo.id),
        },
      });

      promo.stripe_session_id = session.id;
      await promo.save();

      return res.json({ url: session.url, promotion_id: promo.id });
    } catch (error) {
      console.error('Checkout error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Ошибка вебхука: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const promotionId = session.metadata?.promotion_id;
        const paymentIntentId = session.payment_intent;

        if (promotionId) {
          await PromotionRepo.activate(Number(promotionId), paymentIntentId);
        }
      }

      if (event.type === 'checkout.session.expired') {
        const session = event.data.object;
        if (session.metadata?.promotion_id) {
          await PromotionRepo.cancelBySessionId(session.id);
        }
      }
    } catch (err) {
      console.error('Webhook handler error:', err);
    }

    res.json({ received: true });
  }

  async list(req, res) {
    try {
      const creator_id = req.user.id;
      const promotions = await PromotionRepo.getOwnPromotions(creator_id);
      return res.json(promotions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPrices(_req, res) {
    return res.json(PRICES);
  }
}

module.exports = new PromotionController();
