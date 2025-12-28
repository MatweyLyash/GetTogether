const request = require('supertest');
const app = require('../../../app');
const models = require('../../../models');
const jwt = require('jsonwebtoken');
const { createUser } = require('../../factories/userFactory');
const { createCategory, createEvent } = require('../../factories/eventFactory');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

describe('Интеграционные тесты AdminController', () => {
    let admin, adminToken;

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();

        admin = await createUser({
            login: 'admin',
            role_id: 3
        });
        adminToken = jwt.sign({ sub: admin.id }, process.env.JWT_SECRET);
    });

    describe('Работа над категориями', () => {
        it('должен добавить новую категорию', async () => {
            const res = await request(app)
                .post('/api/admin/categories')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ category_name: 'New Category' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Category added successfully');

            const category = await models.Category.findOne({ where: { category_name: 'New Category' } });
            expect(category).toBeDefined();
        });

        it('должен переименовать категорию', async () => {
            const cat = await createCategory({ category_name: 'Old Name' });
            const res = await request(app)
                .put(`/api/admin/categories/${cat.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ category_name: 'New Name' });

            expect(res.status).toBe(200);
            await cat.reload();
            expect(cat.category_name).toBe('New Name');
        });

        it('должен удалить категорию', async () => {
            const cat = await createCategory();
            const res = await request(app)
                .delete(`/api/admin/categories/${cat.id}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(200);
            const deletedCat = await models.Category.findByPk(cat.id);
            expect(deletedCat.deletedAt).not.toBeNull();
        });

        it('должен вернуть 400, если имя категории отсутствует при добавлении', async () => {
            const res = await request(app)
                .post('/api/admin/categories')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({});
            expect(res.status).toBe(400);
        });

        it('должен вернуть 400, если имя категории отсутствует при переименовании', async () => {
            const cat = await createCategory();
            const res = await request(app)
                .put(`/api/admin/categories/${cat.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('Взаимодействие с пользователями', () => {
        it('должен получить список пользователей', async () => {
            await createUser({ login: 'user1' });
            const res = await request(app)
                .get('/api/admin/users')
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(2); // admin + user1
        });

        it('должен заблокировать пользователя', async () => {
            const user = await createUser({ login: 'tobe-banned' });
            const res = await request(app)
                .put(`/api/admin/users/${user.id}/ban`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ isBan: true });

            expect(res.status).toBe(200);
            await user.reload();
            expect(user.is_blocked).toBe(true);
        });

        it('должен разжаловать организатора', async () => {
            const user = await createUser({ role_id: 2 });
            const res = await request(app)
                .put(`/api/admin/organizer/unassign/${user.id}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(200);
            await user.reload();
            expect(user.role_id).toBe(1);
        });
    });

    describe('Заявки организаторов', () => {
        it('должен получить список заявок', async () => {
            const user = await createUser();
            await models.OrganizerRequest.create({ user_id: user.id, status_id: 1 });

            const res = await request(app)
                .get('/api/admin/organizers/request')
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('должен одобрить заявку организатора', async () => {
            const user = await createUser();
            const req = await models.OrganizerRequest.create({ user_id: user.id, status_id: 1 });

            const res = await request(app)
                .put(`/api/admin/organizer/request/${req.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ status_id: 2 });

            expect(res.status).toBe(200);
            await user.reload();
            expect(user.role_id).toBe(2); // Должен стать организатором
        });
    });

    describe('CRUD Достижений', () => {
        it('должен создать достижение', async () => {
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    name: 'Test Achievement',
                    description: 'Desc',
                    score: 10,
                    trigger: 'apply'
                });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Test Achievement');
        });

        it('должен обновить достижение', async () => {
            const ach = await models.Achievement.create({ name: 'Old Name', score: 5, trigger: 'apply' });
            const res = await request(app)
                .put(`/api/admin/achievements/${ach.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'New Name', score: 10, trigger: 'attend' });

            expect(res.status).toBe(200);
            await ach.reload();
            expect(ach.name).toBe('New Name');
            expect(ach.score).toBe(10);
            expect(ach.trigger).toBe('attend');
        });

        it('должен удалить достижение', async () => {
            const ach = await models.Achievement.create({ name: 'To Delete', score: 5, trigger: 'apply' });
            const res = await request(app)
                .delete(`/api/admin/achievements/${ach.id}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(204);
            const found = await models.Achievement.findByPk(ach.id);
            expect(found).toBeNull();
        });
    });

    describe('Взаимодействие над мероприятиями', () => {
        it('должен обновить мероприятие', async () => {
            const event = await createEvent();
            const buffer = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');
            const res = await request(app)
                .put(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .field('title', 'Admin Updated Title')
                .field('description', 'New Desc')
                .field('date', event.date.toISOString())
                .field('location', 'New Location')
                .field('category_id', event.category_id)
                .field('price', 100)
                .field('capacity', 50)
                .attach('image', buffer, 'test.png');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Event updated successfully');
            expect(res.body.event.title).toBe('Admin Updated Title');
        });

        it('должен удалить мероприятие', async () => {
            const event = await createEvent();
            const res = await request(app)
                .delete(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(res.status).toBe(204);
            const found = await models.Event.findByPk(event.id);
            expect(found).toBeNull();
        });

        it('должен вернуть 400, если event_id невалиден при удалении', async () => {
            const res = await request(app)
                .delete('/api/admin/event/invalid')
                .set('Cookie', [`accessToken=${adminToken}`]);
            expect(res.status).toBe(400);
        });

        it('должен вернуть 404, если мероприятие не найдено при обновлении', async () => {
            const event = await createEvent();
            const res = await request(app)
                .put('/api/admin/event/999999')
                .set('Cookie', [`accessToken=${adminToken}`])
                .field('title', 'Admin Updated Title')
                .field('description', 'New Desc')
                .field('date', event.date.toISOString())
                .field('location', 'New Location')
                .field('category_id', event.category_id)
                .field('price', 100)
                .field('capacity', 50);
            expect(res.status).toBe(404);
        });

        it('должен вернуть 400 при ошибке валидации во время обновления', async () => {
            const event = await createEvent();
            const res = await request(app)
                .put(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ title: '' }); // Invalid title
            expect(res.status).toBe(400);
        });
    });

    describe('Негативные сценарии достижений', () => {
        it('должен вернуть 400, если имя или очки отсутствуют при создании', async () => {
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'Test' });
            expect(res.status).toBe(400);
        });

        it('должен обработать base64 изображение при создании', async () => {
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    name: 'Image Ach',
                    score: 10,
                    trigger: 'apply',
                    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
                });
            expect(res.status).toBe(201);
        });

        it('должен вернуть 400, если изображение не строка (вызывает catch)', async () => {
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'Bad', score: 10, trigger: 'apply', image: 123 });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('image должен быть base64');
        });

        it('должен вернуть 404 при обновлении несуществующего достижения', async () => {
            const res = await request(app)
                .put('/api/admin/achievements/99999')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'Update Me', score: 10 });
            expect(res.status).toBe(404);
        });

        it('должен вернуть 400, если изображение при обновлении не строка', async () => {
            const ach = await models.Achievement.create({ name: 'Ach', score: 5, trigger: 'apply' });
            const res = await request(app)
                .put(`/api/admin/achievements/${ach.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ image: 123 });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('image должен быть base64');
        });
    });

    describe('Продвинутые сценарии и обработка ошибок администратора', () => {
        // --- Тесты для createAchievement (работа с изображениями) ---
        it('должен создать достижение с base64 изображением', async () => {
            const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mnk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    name: 'Base64 Ach',
                    score: 10,
                    image: base64Image
                });

            expect(res.status).toBe(201);
            const ach = await models.Achievement.findOne({ where: { name: 'Base64 Ach' } });
            expect(ach.image).not.toBeNull();
        });

        it('не должен создавать достижение с невалидным форматом изображения', async () => {
            const res = await request(app)
                .post('/api/admin/achievements')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    name: 'Bad Img',
                    score: 10,
                    image: 12345 // Не строка
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/image должен быть base64/);
        });

        // --- Тесты для updateEvent (парсинг тегов и валидация) ---
        it('должен обновить мероприятие с тегами в формате JSON-строки', async () => {
            const event = await createEvent();
            
            // 1. Создаем теги
            const tag1 = await models.Tag.create({ name: 'AdminTag1' });
            const tag2 = await models.Tag.create({ name: 'AdminTag2' });
            const tagsJson = JSON.stringify([tag1.id, tag2.id]);
            
            const res = await request(app)
                .put(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .field('title', 'Updated With Tags')
                .field('description', 'Desc')
                .field('date', event.date.toISOString())
                .field('location', 'Loc')
                .field('category_id', event.category_id)
                .field('price', 100)
                .field('capacity', 50)
                .field('tags', tagsJson); // Передаем как строку

            expect(res.status).toBe(200);
        });

        it('должен корректно обработать невалидный JSON в тегах при обновлении', async () => {
            const event = await createEvent();
            const res = await request(app)
                .put(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .field('title', 'Bad Tags')
                .field('description', 'Desc')
                .field('date', event.date.toISOString())
                .field('location', 'Loc')
                .field('category_id', event.category_id)
                .field('price', 100)
                .field('capacity', 50)
                .field('tags', 'invalid-json-string'); // Вызовет ошибку в JSON.parse, но код должен поймать её

            expect(res.status).toBe(200); // Контроллер просто логирует warn и продолжает
        });

        it('должен вернуть 400 при ошибках валидации в updateEvent', async () => {
            const event = await createEvent();
            const res = await request(app)
                .put(`/api/admin/event/${event.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    title: '', // Пустое название
                    description: 'Desc'
                });
            
            expect(res.status).toBe(400);
        });

        // --- Тесты для deleteCategory (проверка удаления связанных данных) ---
        it('должен вернуть 500, если удаление категории не удалось (ошибка БД)', async () => {
            // Пытаемся удалить несуществующую категорию, чтобы проверить обработку ошибок репозитория
            const res = await request(app)
                .delete('/api/admin/categories/999999')
                .set('Cookie', [`accessToken=${adminToken}`]);

            // Репозиторий выбрасывает Error('Категория не найдена'), контроллер ловит и возвращает 500
            expect(res.status).toBe(500); 
            expect(res.body.error).toBe('Категория не найдена');
        });
    });
});