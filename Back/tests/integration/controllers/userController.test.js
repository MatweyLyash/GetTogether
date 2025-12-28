const request = require('supertest');
const app = require('../../../app');
const models = require('../../../models');
const jwt = require('jsonwebtoken');
const { createUser } = require('../../factories/userFactory');
const { createEvent, createCategory } = require('../../factories/eventFactory');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

// ВАЖНО: Добавлен параметр { virtual: true }, чтобы Jest не искал реальный файл
jest.mock('file-type', () => ({
    fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'image/png' })
}), { virtual: true });

describe('UserController Integration', () => {
    let user, token;

    beforeEach(async () => {
        await models.sequelize.sync({ alter: true });
        await cleanDB();
        await seedReferenceData();
        user = await createUser({
            login: 'testuser',
            password_hash: 'hash',
            role_id: 1
        });
        token = jwt.sign({ sub: user.id, login: user.login, role_id: 1 }, process.env.JWT_SECRET);
    });

    describe('GET /api/user/categories', () => {
        it('should return list of categories', async () => {
            await models.Category.create({ category_name: 'Tech' });
            await models.Category.create({ category_name: 'Social' });

            const res = await request(app)
                .get('/api/user/categories')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
            expect(res.body.some(c => c.category_name === 'Tech')).toBe(true);
        });
    });

    describe('GET /api/user/events', () => {
        it('should return list of events', async () => {
            const event = await createEvent({ title: 'Big Party' });

            const res = await request(app)
                .get('/api/user/events')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.some(e => e.title === 'Big Party')).toBe(true);
        });

        it('should return list of events filtered by comma-separated tags', async () => {
            const tag1 = await models.Tag.create({ name: 'UT1' });
            const tag2 = await models.Tag.create({ name: 'UT2' });
            const event1 = await createEvent({ title: 'T1 Event' });
            const event2 = await createEvent({ title: 'T2 Event' });
            await models.EventTag.create({ event_id: event1.id, tag_id: tag1.id });
            await models.EventTag.create({ event_id: event2.id, tag_id: tag2.id });

            const res = await request(app)
                .get(`/api/user/events?tags=${tag1.id},${tag2.id}`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return list of events filtered by tag array', async () => {
            const tag = await models.Tag.create({ name: 'ArrayTag' });
            const event = await createEvent({ title: 'Array Event' });
            await models.EventTag.create({ event_id: event.id, tag_id: tag.id });

            const res = await request(app)
                .get(`/api/user/events?tags=${tag.id}`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.some(e => e.title === 'Array Event')).toBe(true);
        });

        it('should handle JSON tags in query', async () => {
            const tag = await models.Tag.create({ name: 'JSONTag' });
            const res = await request(app)
                .get(`/api/user/events?tags=[${tag.id}]`)
                .set('Cookie', [`accessToken=${token}`]);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/user/event/:event_id', () => {
        it('should return event details with registration info', async () => {
            const event = await createEvent({ title: 'Detail Event' });
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 2 });

            const res = await request(app)
                .get(`/api/user/event/${event.id}`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.event.title).toBe('Detail Event');
            expect(res.body.registration.status).toBe(2);
        });

        it('should return 404 if event not found', async () => {
            const res = await request(app)
                .get('/api/user/event/999999')
                .set('Cookie', [`accessToken=${token}`]);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/user/events/registration', () => {
        it('should register user for an event', async () => {
            const event = await createEvent();

            const res = await request(app)
                .post('/api/user/events/registration')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id });

            expect(res.status).toBe(201);
            expect(res.body.event_id).toBe(event.id);
            expect(res.body.user_id).toBe(user.id);
        });
    });

    describe('PUT /api/user/events/registration/:event_id/cancel', () => {
        it('should cancel registration', async () => {
            const event = await createEvent();
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 1 });

            const res = await request(app)
                .put(`/api/user/events/registration/${event.id}/cancel`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.registration.status_id).toBe(3);
        });

        it('should return 500 if registration not found to cancel', async () => {
            const res = await request(app)
                .put('/api/user/events/registration/999999/cancel')
                .set('Cookie', [`accessToken=${token}`]);
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/user/reviews', () => {
        it('should create a review for a past event', async () => {
            const event = await createEvent({ date: new Date(Date.now() - 86400000) });
            await models.EventRegistration.create({
                user_id: user.id,
                event_id: event.id,
                status_id: 2,
                qr_code: null
            });

            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({
                    event_id: event.id,
                    rating: 5,
                    comment: 'Great!'
                });

            expect(res.status).toBe(201);
            expect(res.body.comment).toBe('Great!');
        });

        it('should return 403 if user not approved', async () => {
            const event = await createEvent({ date: new Date(Date.now() - 86400000) });
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 1 });

            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({
                    event_id: event.id,
                    rating: 5,
                    comment: 'Bad'
                });

            expect(res.status).toBe(403);
        });

        it('should return 400 if event is in the future', async () => {
            const event = await createEvent({ date: new Date(Date.now() + 86400000) });
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 2, qr_code: null });

            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id, rating: 5, comment: 'Future' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if review already exists', async () => {
            const event = await createEvent({ date: new Date(Date.now() - 86400000) });
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 2, qr_code: null });
            await models.Review.create({ user_id: user.id, event_id: event.id, rating: 5, comment: 'First' });

            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id, rating: 5, comment: 'Second' });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/user/events/registration', () => {
        it('should return own registrations and include QR marker', async () => {
            const event = await createEvent();
            await models.EventRegistration.create({
                user_id: user.id,
                event_id: event.id,
                status_id: 2,
                qr_code: Buffer.from('something')
            });

            const res = await request(app)
                .get('/api/user/events/registration')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].qr_code).toBe('QR_CODE_EXISTS');
        });

        it('should trigger ATTEND achievement if conditions met', async () => {
            const event = await createEvent({ date: new Date(Date.now() - 86400000) });
            await models.EventRegistration.create({
                user_id: user.id,
                event_id: event.id,
                status_id: 2,
                qr_code: null 
            });

            const res = await request(app)
                .get('/api/user/events/registration')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
        });
    });

    describe('QR Code', () => {
        it('should return QR code for approved registration', async () => {
            const event = await createEvent();
            const reg = await models.EventRegistration.create({
                user_id: user.id,
                event_id: event.id,
                status_id: 2,
                qr_code: Buffer.from('dummy-qr')
            });

            const res = await request(app)
                .get(`/api/user/events/registration/${reg.id}/qrcode`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.qrCode).toContain('data:image/png;base64');
        });
    });

    describe('Organizer Requests', () => {
        it('should create an organizer request', async () => {
            const res = await request(app)
                .post('/api/user/organizer/request')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(201);
            expect(res.body.user_id).toBe(user.id);
            expect(res.body.status_id).toBe(1);
        });

        it('should return user organizer requests', async () => {
            await models.OrganizerRequest.create({ user_id: user.id, status_id: 1 });

            const res = await request(app)
                .get('/api/user/organizer/request')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
        });
    });

    describe('GET /api/user/achievements', () => {
        it('should return achievements with progress', async () => {
            const ach = await models.Achievement.create({
                name: 'Ach 1',
                description: 'Desc',
                score: 10,
                trigger: 'APPLY'
            });
            await models.UserAchievement.create({
                user_id: user.id,
                achievement_id: ach.id,
                progress: 5,
                is_unlocked: false
            });

            const res = await request(app)
                .get('/api/user/achievements')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.some(a => a.id === ach.id && a.progress === 5)).toBe(true);
        });
    });

    describe('User Profile and Linking', () => {
        it('should return user profile in getMe', async () => {
            const res = await request(app)
                .get('/api/user/me')
                .set('Cookie', [`accessToken=${token}`]);
            expect(res.status).toBe(200);
            expect(res.body.login).toBe(user.login);
        });

        it('should successfully link telegram', async () => {
            user.telegram = 'PENDING_@real_tag';
            await user.save();

            const res = await request(app)
                .post('/api/user/link-telegram')
                .set('Cookie', [`accessToken=${token}`])
                .send({ telegram: '@real_tag' });

            expect(res.status).toBe(200);
            expect(res.body.telegram).toBe('@real_tag');
        });
    });

    describe('User Negative cases', () => {
        it('should return 401 if user not found in getMe', async () => {
            const tempUser = await createUser({ login: 'tempuser' });
            const tempToken = jwt.sign({ sub: tempUser.id, login: tempUser.login, role_id: 1 }, process.env.JWT_SECRET);
            await models.User.destroy({ where: { id: tempUser.id }, force: true });

            const res = await request(app)
                .get('/api/user/me')
                .set('Cookie', [`accessToken=${tempToken}`]);
            expect(res.status).toBe(401);
        });

        it('should return 400 if telegram tag doesn\'t start with @', async () => {
            const res = await request(app)
                .post('/api/user/link-telegram')
                .set('Cookie', [`accessToken=${token}`])
                .send({ telegram: 'badtag' });
            expect(res.status).toBe(400);
        });
    });

    describe('User Controller Edge Cases', () => {
        it('should filter events when tags is a single value string', async () => {
            const tag = await models.Tag.create({ name: 'Single' });
            const event = await createEvent({ title: 'Single Tag Event' });
            await models.EventTag.create({ event_id: event.id, tag_id: tag.id });

            const res = await request(app)
                .get(`/api/user/events?tags=${tag.id}`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            expect(res.body.some(e => e.title === 'Single Tag Event')).toBe(true);
        });

        it('should filter events when tags is a JSON array string', async () => {
            const tag = await models.Tag.create({ name: 'JsonTag' });
            const event = await createEvent({ title: 'Json Tag Event' });
            await models.EventTag.create({ event_id: event.id, tag_id: tag.id });

            const tagsParam = JSON.stringify([tag.id]);
            const res = await request(app)
                .get(`/api/user/events?tags=${encodeURIComponent(tagsParam)}`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
        });

        it('should handle image conversion to base64 in getEvents', async () => {
            const cat = await models.Category.create({ category_name: 'TestCat' });
            const imgBuffer = Buffer.from('fake_image_data');
            await models.Event.create({
                title: 'Img Event',
                description: 'D',
                date: new Date(),
                location: 'L',
                category_id: cat.id,
                price: 0,
                capacity: 10,
                creator_id: user.id,
                image: imgBuffer
            });

            const res = await request(app)
                .get('/api/user/events')
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(200);
            const event = res.body.find(e => e.title === 'Img Event');
            expect(typeof event.image).toBe('string');
            expect(event.image).toMatch(/^data:/);
        });

        it('should return 400 if rating is invalid', async () => {
            const event = await createEvent();
            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id, rating: 6, comment: 'Good' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if comment is too long or empty', async () => {
            const event = await createEvent();
            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id, rating: 5, comment: '' });

            expect(res.status).toBe(400);
        });

        it('should return 403 if trying to review without registration', async () => {
            const event = await createEvent({ date: new Date(Date.now() - 10000) });
            const res = await request(app)
                .post('/api/user/reviews')
                .set('Cookie', [`accessToken=${token}`])
                .send({ event_id: event.id, rating: 5, comment: 'Ninja review' });
            
            expect(res.status).toBe(403); 
        });

        it('should return 404 if QR code was already used (is null)', async () => {
            const event = await createEvent();
            const reg = await models.EventRegistration.create({
                user_id: user.id,
                event_id: event.id,
                status_id: 2,
                qr_code: null
            });

            const res = await request(app)
                .get(`/api/user/events/registration/${reg.id}/qrcode`)
                .set('Cookie', [`accessToken=${token}`]);

            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/использован ранее/);
        });
    });
});