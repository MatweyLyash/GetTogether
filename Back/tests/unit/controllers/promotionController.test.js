const mockCheckoutCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => jest.fn(() => ({
    checkout: {
        sessions: {
            create: mockCheckoutCreate,
        },
    },
    webhooks: {
        constructEvent: mockConstructEvent,
    },
})));

const mockEventFindOne = jest.fn();
const mockPromotionCreate = jest.fn();
const mockPromotionActivate = jest.fn();
const mockPromotionCancel = jest.fn();
const mockGetOwnPromotions = jest.fn();

jest.mock('../../../models', () => ({
    Event: {
        findOne: mockEventFindOne,
    },
    Promotion: {},
}));

jest.mock('../../../repository/promotionRepository', () => ({
    PRICES: {
        one_time: { byn: 2, usd_cents: 60, default_days: 1 },
        boost: { byn: 5, usd_cents: 150, default_days: 3 },
    },
    repository: {
        create: mockPromotionCreate,
        activate: mockPromotionActivate,
        cancelBySessionId: mockPromotionCancel,
        getOwnPromotions: mockGetOwnPromotions,
    },
}));

const PromotionController = require('../../../controllers/promotionController');

const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe('PromotionController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a checkout session for an owned event', async () => {
        const promo = {
            id: 7,
            duration_days: 3,
            amount_usd_cents: 150,
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockEventFindOne.mockResolvedValue({ id: 10, title: 'Promo Event' });
        mockPromotionCreate.mockResolvedValue(promo);
        mockCheckoutCreate.mockResolvedValue({ id: 'sess_1', url: 'https://stripe.test/checkout' });

        const req = {
            user: { id: 3 },
            body: { event_id: 10, type: 'boost' },
        };
        const res = makeRes();

        await PromotionController.checkout(req, res);

        expect(mockEventFindOne).toHaveBeenCalledWith({ where: { id: 10, creator_id: 3 } });
        expect(mockPromotionCreate).toHaveBeenCalledWith(10, 'boost', 3);
        expect(mockCheckoutCreate).toHaveBeenCalledWith(expect.objectContaining({
            mode: 'payment',
            metadata: { promotion_id: '7' },
        }));
        expect(promo.stripe_session_id).toBe('sess_1');
        expect(promo.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ url: 'https://stripe.test/checkout', promotion_id: 7 });
    });

    it('validates checkout request and event ownership', async () => {
        const missingRes = makeRes();
        await PromotionController.checkout({ user: { id: 1 }, body: {} }, missingRes);
        expect(missingRes.status).toHaveBeenCalledWith(400);
        expect(missingRes.json).toHaveBeenCalledWith({ error: 'event_id и type обязательны' });

        mockEventFindOne.mockResolvedValue(null);
        const forbiddenRes = makeRes();
        await PromotionController.checkout({ user: { id: 1 }, body: { event_id: 1, type: 'boost' } }, forbiddenRes);
        expect(forbiddenRes.status).toHaveBeenCalledWith(403);
        expect(forbiddenRes.json).toHaveBeenCalledWith({ error: 'Мероприятие не найдено или нет доступа' });

        mockEventFindOne.mockResolvedValue({ id: 1, title: 'Event' });
        const badTypeRes = makeRes();
        await PromotionController.checkout({ user: { id: 1 }, body: { event_id: 1, type: 'invalid' } }, badTypeRes);
        expect(badTypeRes.status).toHaveBeenCalledWith(400);
        expect(badTypeRes.json).toHaveBeenCalledWith({ error: 'Некорректный тип продвижения' });
    });

    it('handles Stripe webhook completion and expiration events', async () => {
        mockConstructEvent.mockReturnValueOnce({
            type: 'checkout.session.completed',
            data: { object: { metadata: { promotion_id: '42' }, payment_intent: 'pi_42' } },
        });
        const completedRes = makeRes();
        await PromotionController.webhook({ body: Buffer.from('{}'), headers: { 'stripe-signature': 'sig' } }, completedRes);
        expect(mockPromotionActivate).toHaveBeenCalledWith(42, 'pi_42');
        expect(completedRes.json).toHaveBeenCalledWith({ received: true });

        mockConstructEvent.mockReturnValueOnce({
            type: 'checkout.session.expired',
            data: { object: { id: 'sess_expired', metadata: { promotion_id: '42' } } },
        });
        const expiredRes = makeRes();
        await PromotionController.webhook({ body: Buffer.from('{}'), headers: { 'stripe-signature': 'sig' } }, expiredRes);
        expect(mockPromotionCancel).toHaveBeenCalledWith('sess_expired');
        expect(expiredRes.json).toHaveBeenCalledWith({ received: true });
    });

    it('returns 400 when webhook signature verification fails', async () => {
        mockConstructEvent.mockImplementationOnce(() => {
            throw new Error('bad signature');
        });
        const res = makeRes();

        await PromotionController.webhook({ body: Buffer.from('{}'), headers: { 'stripe-signature': 'bad' } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Ошибка вебхука: bad signature');
    });

    it('lists promotions and exposes prices', async () => {
        mockGetOwnPromotions.mockResolvedValue([{ id: 1 }]);
        const listRes = makeRes();
        await PromotionController.list({ user: { id: 5 } }, listRes);
        expect(mockGetOwnPromotions).toHaveBeenCalledWith(5);
        expect(listRes.json).toHaveBeenCalledWith([{ id: 1 }]);

        const pricesRes = makeRes();
        await PromotionController.getPrices({}, pricesRes);
        expect(pricesRes.json).toHaveBeenCalledWith(expect.objectContaining({
            one_time: expect.any(Object),
            boost: expect.any(Object),
        }));
    });
});
