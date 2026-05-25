const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../app');
const models = require('../../../models');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');
const { createUser } = require('../../factories/userFactory');
const { createEvent } = require('../../factories/eventFactory');

describe('Event views and waitlist integration', () => {
    let user;
    let organizer;
    let userToken;
    let organizerToken;

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();

        user = await createUser({ login: 'waitlist-user', role_id: 1 });
        organizer = await createUser({ login: 'stats-organizer', role_id: 2 });
        userToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
        organizerToken = jwt.sign({ sub: organizer.id }, process.env.JWT_SECRET);
    });

    describe('event views', () => {
        it('records anonymous and authenticated views and returns organizer stats', async () => {
            const event = await createEvent({ creator_id: organizer.id, title: 'Viewed Event' });
            await models.EventRegistration.create({ user_id: user.id, event_id: event.id, status_id: 1 });

            const anonymousView = await request(app)
                .post(`/api/guest/event/${event.id}/view`)
                .set('x-forwarded-for', '10.0.0.1');
            expect(anonymousView.status).toBe(201);
            expect(anonymousView.body.recorded).toBe(true);

            const authView = await request(app)
                .post(`/api/guest/event/${event.id}/view`)
                .set('Cookie', [`accessToken=${userToken}`])
                .set('x-forwarded-for', '10.0.0.2');
            expect(authView.status).toBe(201);

            const stats = await request(app)
                .get('/api/organizer/stats')
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(stats.status).toBe(200);
            expect(stats.body.events).toHaveLength(1);
            expect(stats.body.events[0]).toMatchObject({
                id: event.id,
                title: 'Viewed Event',
                total_views: 2,
                unique_views: 2,
                registrations: 1,
                conversion: 50,
            });
            expect(stats.body.totals).toMatchObject({
                views: 2,
                uniqueViews: 2,
                registrations: 1,
                conversion: 50,
            });
            expect(stats.body.viewsByDay.length).toBeGreaterThan(0);
        });

        it('returns empty organizer stats when organizer has no events', async () => {
            const res = await request(app)
                .get('/api/organizer/stats')
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                events: [],
                viewsByDay: [],
                totals: { views: 0, uniqueViews: 0, registrations: 0, conversion: 0 },
            });
        });
    });

    describe('waitlist', () => {
        it('adds, lists, and removes a waitlist item for a full event', async () => {
            const event = await createEvent({ creator_id: organizer.id, capacity: 0 });

            const createRes = await request(app)
                .post('/api/user/waitlist')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ event_id: event.id, notification_method: 'browser' });

            expect(createRes.status).toBe(201);
            expect(createRes.body.user_id).toBe(user.id);
            expect(createRes.body.event_id).toBe(event.id);

            const listRes = await request(app)
                .get('/api/user/waitlist')
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(listRes.status).toBe(200);
            expect(listRes.body).toHaveLength(1);
            expect(listRes.body[0].event.title).toBe(event.title);

            const deleteRes = await request(app)
                .delete(`/api/user/waitlist/${createRes.body.id}`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(deleteRes.status).toBe(204);
        });

        it('rejects invalid waitlist requests', async () => {
            const eventWithPlaces = await createEvent({ creator_id: organizer.id, capacity: 5 });

            const missingEvent = await request(app)
                .post('/api/user/waitlist')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ notification_method: 'browser' });
            expect(missingEvent.status).toBe(400);
            expect(missingEvent.body.error).toBe('ID мероприятия обязательно');

            const invalidMethod = await request(app)
                .post('/api/user/waitlist')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ event_id: eventWithPlaces.id, notification_method: 'email' });
            expect(invalidMethod.status).toBe(400);
            expect(invalidMethod.body.error).toBe('Некорректный способ уведомления');

            const hasCapacity = await request(app)
                .post('/api/user/waitlist')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ event_id: eventWithPlaces.id, notification_method: 'telegram' });
            expect(hasCapacity.status).toBe(400);
            expect(hasCapacity.body.error).toBe('На мероприятии есть свободные места');
        });

        it('returns 404 when removing someone else waitlist item', async () => {
            const event = await createEvent({ creator_id: organizer.id, capacity: 0 });
            const otherUser = await createUser({ login: 'waitlist-owner' });
            const item = await models.EventWaitlist.create({
                user_id: otherUser.id,
                event_id: event.id,
                notification_method: 'telegram',
            });

            const res = await request(app)
                .delete(`/api/user/waitlist/${item.id}`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Запись в списке ожидания не найдена');
        });
    });
});
