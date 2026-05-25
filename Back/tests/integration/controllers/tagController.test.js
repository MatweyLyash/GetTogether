const request = require('supertest');
const app = require('../../../app');
const models = require('../../../models');
const jwt = require('jsonwebtoken');
const { createUser } = require('../../factories/userFactory');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

describe('TagController Integration', () => {
    let adminToken, userToken;

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();

        const admin = await createUser({ login: 'admin', role_id: 3 });
        adminToken = jwt.sign({ sub: admin.id }, process.env.JWT_SECRET);

        const user = await createUser({ login: 'user' });
        userToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    });

    it('should create a tag (admin only)', async () => {
        const res = await request(app)
            .post('/api/admin/tags')
            .set('Cookie', [`accessToken=${adminToken}`])
            .send({ name: 'Fest' });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Fest');
    });

    it('should return 403 when user tries to create a tag', async () => {
        const res = await request(app)
            .post('/api/admin/tags')
            .set('Cookie', [`accessToken=${userToken}`])
            .send({ name: 'Fest' });

        expect(res.status).toBe(403);
    });

    it('should list tags for users', async () => {
        await models.Tag.create({ name: 'Music' });
        const res = await request(app)
            .get('/api/user/tags')
            .set('Cookie', [`accessToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.some(t => t.name === 'Music')).toBe(true);
    });

    it('should update a tag (admin)', async () => {
        const tag = await models.Tag.create({ name: 'Old' });
        const res = await request(app)
            .put(`/api/admin/tags/${tag.id}`)
            .set('Cookie', [`accessToken=${adminToken}`])
            .send({ name: 'New' });

        expect(res.status).toBe(200);
        await tag.reload();
        expect(tag.name).toBe('New');
    });

    it('should delete a tag (admin)', async () => {
        const tag = await models.Tag.create({ name: 'To be deleted' });
        const res = await request(app)
            .delete(`/api/admin/tags/${tag.id}`)
            .set('Cookie', [`accessToken=${adminToken}`]);

        expect(res.status).toBe(200);
        const found = await models.Tag.findByPk(tag.id);
        expect(found).toBeNull(); // Because paranoid: true, but destroy() might really remove it if configured so, or soft delete.
        // Actually Tag model usually has paranoid: true. Let's check model.
    });

    describe('Negative cases', () => {
        it('should return 400 if name is missing when creating tag', async () => {
            const res = await request(app)
                .post('/api/admin/tags')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Название обязательно');
        });

        it('should return 400 if name is missing when updating tag', async () => {
            const tag = await models.Tag.create({ name: 'UpdateMe' });
            const res = await request(app)
                .put(`/api/admin/tags/${tag.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Название обязательно');
        });

        it('should return 400 if tag already exists', async () => {
            await models.Tag.create({ name: 'existing' });
            const res = await request(app)
                .post('/api/admin/tags')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'existing' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Тег уже существует');
        });

        it('should return 404 if updating non-existent tag', async () => {
            const res = await request(app)
                .put('/api/admin/tags/999999')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'Some Name' });
            expect(res.status).toBe(404);
        });

        it('should return 404 if deleting non-existent tag', async () => {
            const res = await request(app)
                .delete('/api/admin/tags/999999')
                .set('Cookie', [`accessToken=${adminToken}`]);
            expect(res.status).toBe(404);
        });

        it('should return 400 if updating tag to already existing name', async () => {
            await models.Tag.create({ name: 'T1' });
            const t2 = await models.Tag.create({ name: 'T2' });
            const res = await request(app)
                .put(`/api/admin/tags/${t2.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ name: 'T1' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Тег с таким названием уже существует');
        });
    });
});
