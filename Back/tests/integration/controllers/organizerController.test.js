const request = require('supertest');
const app = require('../../../app');
const models = require('../../../models');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { createUser } = require('../../factories/userFactory');
const { createEvent, createCategory } = require('../../factories/eventFactory');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

describe('OrganizerController Integration', () => {
    let organizer, organizerToken;
    let category;

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();

        organizer = await createUser({
            login: 'organizer',
            role_id: 2
        });
        organizerToken = jwt.sign({ sub: organizer.id }, process.env.JWT_SECRET);

        category = await createCategory();
    });

    describe('Event Lifecycle', () => {
        it('should create a new event', async () => {
            const res = await request(app)
                .post('/api/organizer/event')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('title', 'Summer Fest')
                .field('description', 'A great festival')
                .field('date', new Date(Date.now() + 86400000).toISOString())
                .field('location', 'High Park')
                .field('category_id', category.id)
                .field('price', 10)
                .field('capacity', 100);

            expect(res.status).toBe(201);
            expect(res.body.event.title).toBe('Summer Fest');
            expect(res.body.event.category_id).toBe(category.id);
            expect(res.body.message).toContain('Событие создано');
        });

        it('should handle tag parsing error gracefully', async () => {
            const cat = await models.Category.create({ category_name: 'Organizer Cat' });
            const res = await request(app)
                .post('/api/organizer/event')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('title', 'Bad Tags Event')
                .field('description', 'Desc')
                .field('date', '2025-12-31')
                .field('location', 'Loc')
                .field('category_id', cat.id)
                .field('price', 100)
                .field('capacity', 50)
                .field('tags', 'not-json-and-not-array');

            expect(res.status).toBe(201); // Controller warns but continues
        });

        it('should create an event with an image', async () => {
            const cat = await models.Category.create({ category_name: 'Image Cat' });
            // Small 1x1 black GIF
            const buffer = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');

            const res = await request(app)
                .post('/api/organizer/event')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('title', 'Image Event')
                .field('description', 'With Image')
                .field('date', '2025-12-31')
                .field('location', 'Online')
                .field('category_id', cat.id)
                .field('price', 0)
                .field('capacity', 100)
                .attach('image', buffer, 'test.png');

            if (res.status !== 201) throw new Error(`STATUS: ${res.status} BODY: ${JSON.stringify(res.body)}`);
            expect(res.status).toBe(201);
            expect(res.body.event.image).toContain('data:image/gif;base64');
        });

        it('should list own events', async () => {
            await createEvent({ creator_id: organizer.id, title: 'My Event' });

            const res = await request(app)
                .get('/api/organizer/events')
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].title).toBe('My Event');
        });

        it('should update an event', async () => {
            const event = await createEvent({ creator_id: organizer.id, title: 'Old Title' });

            const res = await request(app)
                .put(`/api/organizer/event/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('event_id', event.id)
                .field('title', 'Updated Title')
                .field('description', event.description)
                .field('date', event.date.toISOString())
                .field('location', event.location)
                .field('category_id', event.category_id)
                .field('price', event.price)
                .field('capacity', event.capacity);

            expect(res.status).toBe(200);
            expect(res.body.event.title).toBe('Updated Title');
        });

        it('should update an event with an image', async () => {
            const event = await createEvent({ creator_id: organizer.id });
            const buffer = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');

            const res = await request(app)
                .put(`/api/organizer/event/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('event_id', event.id)
                .field('title', 'New Title')
                .field('description', 'New Desc')
                .field('date', '2025-12-31')
                .field('location', 'New Loc')
                .field('category_id', event.category_id)
                .field('price', 20)
                .field('capacity', 20)
                .attach('image', buffer, 'test.png');

            expect(res.status).toBe(200);
            expect(res.body.event.image).toContain('data:image/gif;base64');
        });

        it('should delete an event', async () => {
            const event = await createEvent({ creator_id: organizer.id });

            const res = await request(app)
                .delete(`/api/organizer/event/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(res.status).toBe(204);
            const found = await models.Event.findByPk(event.id);
            expect(found).toBeNull();
        });
    });

    describe('Registration Management', () => {
        it('should list requests for an event', async () => {
            const event = await createEvent({ creator_id: organizer.id });
            const attendee = await createUser({ login: 'attendee' });
            await models.EventRegistration.create({ user_id: attendee.id, event_id: event.id, status_id: 1 });

            const res = await request(app)
                .get(`/api/organizer/event/requests/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].user.login).toBe('attendee');
        });

        it('should approve a registration', async () => {
            const event = await createEvent({ creator_id: organizer.id, telegram_chat_id: '12345' });
            const attendee = await createUser({ login: 'attendee' });
            await models.EventRegistration.create({ user_id: attendee.id, event_id: event.id, status_id: 1 });

            const res = await request(app)
                .put(`/api/organizer/event/request/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ user_id: attendee.id, status_id: 2 });

            expect(res.status).toBe(200);
            expect(res.body.status_id).toBe(2);
        });
    });

    describe('GET /api/organizer/event/:event_id', () => {
        it('should return own event details', async () => {
            const event = await createEvent({ creator_id: organizer.id });
            const res = await request(app)
                .get(`/api/organizer/event/${event.id}`)
                .set('Cookie', [`accessToken=${organizerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(event.id);
        });
    });

    describe('POST /api/organizer/verify-registration', () => {
        it('should verify registration from QR data', async () => {
            const event = await createEvent({ creator_id: organizer.id });
            const attendee = await createUser();
            const reg = await models.EventRegistration.create({
                user_id: attendee.id,
                event_id: event.id,
                status_id: 2,
                qr_code: Buffer.from('dummy')
            });

            const qrData = JSON.stringify({
                registrationId: reg.id,
                eventId: event.id,
                userId: attendee.id
            });

            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('Подтверждено');

            await reg.reload();
            expect(reg.qr_code).toBeNull(); // QR code should be cleared after verification
        });

        it('should return 400 if qrData is missing', async () => {
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if qrData is invalid JSON', async () => {
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if qrData is incomplete', async () => {
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData: JSON.stringify({ registrationId: 1 }) });
            expect(res.status).toBe(400);
        });
    });

    describe('Organizer Negative cases', () => {
        it('should return 400 if event_id is invalid for delete', async () => {
            const res = await request(app)
                .delete('/api/organizer/event/invalid')
                .set('Cookie', [`accessToken=${organizerToken}`]);
            expect(res.status).toBe(400);
        });

        it('should return 400 for responseToEventRequest with invalid IDs', async () => {
            const res = await request(app)
                .put('/api/organizer/event/request/invalid')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ user_id: 'invalid', status_id: 2 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if getEventRequests has invalid event_id', async () => {
            const res = await request(app)
                .get('/api/organizer/event/requests/invalid')
                .set('Cookie', [`accessToken=${organizerToken}`]);
            expect(res.status).toBe(400);
        });

        it('should return 400 if registration is not confirmed during verification', async () => {
            const cat = await models.Category.create({ category_name: 'Verify Cat' });
            const event = await models.Event.create({
                creator_id: organizer.id,
                title: 'Verify Event',
                description: 'Desc',
                date: '2025-12-31',
                location: 'Loc',
                category_id: cat.id,
                price: 10,
                capacity: 10,
                organizer_verification_key: 'vkey'
            });
            const user2 = await models.User.create({ login: 'user2', password_hash: 'hash', role_id: 1 });
            const reg = await models.EventRegistration.create({
                user_id: user2.id,
                event_id: event.id,
                status_id: 1 // Pending
            });

            const qrData = JSON.stringify({ registrationId: reg.id, eventId: event.id, userId: user2.id });
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Регистрация не подтверждена');
        });

        it('should return 400 if registration not found during verification', async () => {
            const cat = await models.Category.create({ category_name: 'Verify Cat 2' });
            const event = await models.Event.create({
                creator_id: organizer.id,
                title: 'Verify Event 2',
                description: 'Desc',
                date: '2025-12-31',
                location: 'Loc',
                category_id: cat.id,
                price: 10,
                capacity: 10,
                organizer_verification_key: 'vkey2'
            });

            const qrData = JSON.stringify({ registrationId: 999999, eventId: event.id, userId: 123 });
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Регистрация не найдена');
        });
    });

    describe('Organizer Controller Edge Cases', () => {
        // --- Тесты для createEvent (multipart/form-data и теги) ---
        it('should parse tags from JSON string in multipart request', async () => {
            // 1. Создаем реальные теги в БД
            const tag1 = await models.Tag.create({ name: 'TagA' });
            const tag2 = await models.Tag.create({ name: 'TagB' });
            
            // 2. Формируем JSON с их реальными ID
            const tagsJson = JSON.stringify([tag1.id, tag2.id]);

            const buffer = Buffer.from('img');
            const res = await request(app)
                .post('/api/organizer/event')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('title', 'Multipart Event')
                .field('description', 'Desc')
                .field('date', new Date(Date.now() + 10000).toISOString())
                .field('location', 'Loc')
                .field('category_id', category.id)
                .field('price', 10)
                .field('capacity', 10)
                .field('tags', tagsJson) // <--- Передаем существующие ID
                .attach('image', buffer, 'test.png');

            if (res.status !== 201) {
                console.error('Error body:', res.body);
            }
            expect(res.status).toBe(201);
        });

        it('should return 400 on validation error (e.g. invalid date)', async () => {
             const res = await request(app)
                .post('/api/organizer/event')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .field('title', 'Bad Date')
                .field('date', 'not-a-date'); // Невалидная дата

            expect(res.status).toBe(400);
        });

        // --- Тесты для verifyEventRegistration (QR проверка) ---
        it('should return 400 if qrData is invalid JSON', async () => {
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData: '{ bad json' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid QR Data format');
        });

        it('should return 400 if qrData is incomplete', async () => {
            // Отсутствуют eventId и userId
            const qrData = JSON.stringify({ registrationId: 1 });
            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Incomplete QR Data');
        });

        it('should return 400 if event does not belong to organizer', async () => {
            // Создаем событие от другого пользователя
            const otherUser = await createUser({ login: 'other', role_id: 2 });
            const otherEvent = await createEvent({ creator_id: otherUser.id });
            const reg = await models.EventRegistration.create({
                 user_id: organizer.id, event_id: otherEvent.id, status_id: 2 
            });

            const qrData = JSON.stringify({ 
                registrationId: reg.id, 
                eventId: otherEvent.id, 
                userId: organizer.id 
            });

            const res = await request(app)
                .post('/api/organizer/verify-registration')
                .set('Cookie', [`accessToken=${organizerToken}`])
                .send({ qrData });

            // Ошибка: "Событие не найдено или вы не являетесь его организатором"
            expect(res.status).toBe(400); 
        });
    });
});
