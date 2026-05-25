const models = require('../../../models');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');
const { createUser } = require('../../factories/userFactory');
const { createEvent } = require('../../factories/eventFactory');
const { repository: PromotionRepository } = require('../../../repository/promotionRepository');

describe('PromotionRepository integration', () => {
    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();
    });

    it('calculates prices for fixed and duration based promotions', () => {
        expect(PromotionRepository.constructor.calcPrice('one_time', 10)).toEqual({
            amount_byn: 2,
            amount_usd_cents: 60,
            duration_days: 1,
        });
        expect(PromotionRepository.constructor.calcPrice('boost', 99)).toEqual({
            amount_byn: 5,
            amount_usd_cents: 150,
            duration_days: 3,
        });
        expect(PromotionRepository.constructor.calcPrice('repeat', 20)).toEqual({
            amount_byn: 21,
            amount_usd_cents: 630,
            duration_days: 7,
        });
        expect(PromotionRepository.constructor.calcPrice('premium', 0)).toEqual({
            amount_byn: 5,
            amount_usd_cents: 150,
            duration_days: 1,
        });
        expect(PromotionRepository.constructor.calcPrice('unknown', 1)).toBeNull();
    });

    it('creates, activates, finds and cancels promotions', async () => {
        const event = await createEvent();
        const promo = await PromotionRepository.create(event.id, 'repeat', 2);

        expect(promo.duration_days).toBe(2);
        expect(Number(promo.amount_byn)).toBe(6);
        expect(promo.amount_usd_cents).toBe(180);

        promo.stripe_session_id = 'sess_123';
        await promo.save();

        const foundBySession = await PromotionRepository.findBySessionId('sess_123');
        expect(foundBySession.id).toBe(promo.id);

        const activated = await PromotionRepository.activate(promo.id, 'pi_123');
        expect(activated.is_paid).toBe(true);
        expect(activated.status).toBe('active');
        expect(activated.stripe_payment_intent_id).toBe('pi_123');
        expect(activated.expires_at).toBeTruthy();

        const active = await PromotionRepository.getActiveByEventId(event.id);
        expect(active.id).toBe(promo.id);

        const cancelled = await PromotionRepository.cancelBySessionId('sess_123');
        expect(cancelled.status).toBe('cancelled');
        await expect(PromotionRepository.activate(999999, 'pi_missing')).rejects.toThrow('Продвижение не найдено');
        await expect(PromotionRepository.create(event.id, 'bad_type', 1)).rejects.toThrow('Некорректный тип продвижения');
        await expect(PromotionRepository.cancelBySessionId('missing_session')).resolves.toBeNull();
    });

    it('lists owner promotions and expires outdated active promotions', async () => {
        const organizer = await createUser({ role_id: 2 });
        const event = await createEvent({ creator_id: organizer.id, title: 'Promoted Event' });
        const promo = await models.Promotion.create({
            event_id: event.id,
            type: 'boost',
            duration_days: 3,
            amount_byn: 5,
            amount_usd_cents: 150,
            is_paid: true,
            status: 'active',
            expires_at: new Date(Date.now() - 86400000),
        });

        const promotions = await PromotionRepository.getOwnPromotions(organizer.id);
        expect(promotions).toHaveLength(1);
        expect(promotions[0].event.title).toBe('Promoted Event');

        const [updatedCount] = await PromotionRepository.expireOld();
        expect(updatedCount).toBeGreaterThanOrEqual(1);
        await promo.reload();
        expect(promo.status).toBe('expired');
    });
});
