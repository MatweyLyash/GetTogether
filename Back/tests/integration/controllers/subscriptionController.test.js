const request = require('supertest');
const app = require('../../../app');
const models = require('../../../models');
const jwt = require('jsonwebtoken');
const { createUser } = require('../../factories/userFactory');
const { createCategory } = require('../../factories/eventFactory');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

describe('SubscriptionController Integration', () => {
    let user, token;

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();

        user = await createUser();
        token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    });

    it('should create a category subscription', async () => {
        const cat = await createCategory();
        const res = await request(app)
            .post('/api/user/subscriptions')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                subscription_type: 'category',
                target_id: cat.id,
                notification_method: 'telegram'
            });

        expect(res.status).toBe(201);
        expect(res.body.target_id).toBe(cat.id);
    });

    it('should list subscriptions', async () => {
        const cat = await createCategory();
        await models.EventSubscription.create({
            user_id: user.id,
            subscription_type: 'category',
            target_id: cat.id,
            notification_method: 'telegram'
        });

        const res = await request(app)
            .get('/api/user/subscriptions')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('should delete a subscription', async () => {
        const cat = await createCategory();
        const sub = await models.EventSubscription.create({
            user_id: user.id,
            subscription_type: 'category',
            target_id: cat.id,
            notification_method: 'telegram'
        });

        const res = await request(app)
            .delete(`/api/user/subscriptions/${sub.id}`)
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.status).toBe(204);
        const found = await models.EventSubscription.findByPk(sub.id);
        expect(found).toBeNull();
    });

    describe('Negative cases', () => {
        it('should return 400 for invalid subscription_type', async () => {
            const res = await request(app)
                .post('/api/user/subscriptions')
                .set('Cookie', [`accessToken=${token}`])
                .send({ subscription_type: 'invalid', target_id: 1, notification_method: 'telegram' });
            expect(res.status).toBe(400);
        });

        it('should return 400 for invalid notification_method', async () => {
            const res = await request(app)
                .post('/api/user/subscriptions')
                .set('Cookie', [`accessToken=${token}`])
                .send({ subscription_type: 'category', target_id: 1, notification_method: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('should return 409 for duplicate subscription', async () => {
            const payload = { subscription_type: 'category', target_id: 10, notification_method: 'telegram' };
            await request(app)
                .post('/api/user/subscriptions')
                .set('Cookie', [`accessToken=${token}`])
                .send(payload);

            const res = await request(app)
                .post('/api/user/subscriptions')
                .set('Cookie', [`accessToken=${token}`])
                .send(payload);

            expect(res.status).toBe(409);
        });

        it('should return 400 if target_id is missing', async () => {
            const res = await request(app)
                .post('/api/user/subscriptions')
                .set('Cookie', [`accessToken=${token}`])
                .send({ subscription_type: 'category', notification_method: 'telegram' });
            expect(res.status).toBe(400);
        });

        it('should return 404 if subscription not found', async () => {
            const res = await request(app)
                .delete('/api/user/subscriptions/999999')
                .set('Cookie', [`accessToken=${token}`]);
            expect(res.status).toBe(404);
        });
    });
});
