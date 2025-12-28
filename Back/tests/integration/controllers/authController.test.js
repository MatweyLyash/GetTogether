const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../app');
const models = require('../../../models');
const bcrypt = require('bcryptjs');
const cleanDB = require('../../helpers/dbCleanup');
const seedReferenceData = require('../../helpers/seedReferenceData');

describe('AuthController Integration', () => {
    beforeAll(async () => {
        // We might want to sync the DB if it's not and we have migrations
        // But for unit/integration tests with mocks or dedicated DB, 
        // we'll assume the DB is ready or handled in setup.js
    });

    beforeEach(async () => {
        await cleanDB();
        await seedReferenceData();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    login: 'newuser',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Пользователь успешно зарегистрирован');
            expect(res.body.user.login).toBe('newuser');
            expect(res.header['set-cookie']).toBeDefined();
        });

        it('should return 400 for duplicate login', async () => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);
            await models.User.create({ login: 'existinguser', password_hash, role_id: 1 });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    login: 'existinguser',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пользователь с таким логином уже существует');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);
            await models.User.create({ login: 'testuser', password_hash, role_id: 1 });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    login: 'testuser',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Успешная авторизация');
            expect(res.header['set-cookie']).toBeDefined();
        });

        it('should return 400 for incorrect password', async () => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);
            await models.User.create({ login: 'wrongpassuser', password_hash, role_id: 1 });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    login: 'wrongpassuser',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Неверный логин или пароль');
        });

        it('should return 400 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    login: 'nonexistent',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Неверный логин или пароль');
        });

        it('should return 403 for blocked user', async () => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);
            await models.User.create({ login: 'blockeduser', password_hash, role_id: 1, is_blocked: true });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    login: 'blockeduser',
                    password: 'password123'
                });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Ваш аккаунт заблокирован');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        let refreshToken;

        beforeEach(async () => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);
            await models.User.create({ login: 'refreshuser', password_hash, role_id: 1 });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ login: 'refreshuser', password: 'password123' });

            refreshToken = loginRes.header['set-cookie'][1].split(';')[0].split('=')[1];
        });

        it('should return a new access token when given valid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', [`refreshToken=${refreshToken}`]);

            expect(res.status).toBe(200);
            expect(res.header['set-cookie']).toBeDefined();
            expect(res.header['set-cookie'].some(c => c.startsWith('accessToken='))).toBe(true);
        });

        it('should return 401 if refresh token is missing', async () => {
            const res = await request(app).post('/api/auth/refresh-token');
            expect(res.status).toBe(401);
        });

        it('should return 401 if refresh token is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=invalid-token']);
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Недействительный refresh токен');
        });

        it('should return 401 if user not found during refresh', async () => {
            const tempUser = await models.User.create({
                login: 'refreshtest',
                password_hash: 'hash',
                role_id: 1
            });
            const refreshToken = jwt.sign({
                sub: tempUser.id,
                login: tempUser.login,
                role_id: tempUser.role_id,
            }, process.env.JWT_REFRESH_SECRET);

            await models.User.destroy({ where: { id: tempUser.id }, force: true });

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', [`refreshToken=${refreshToken}`]);
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Пользователь не найден');
        });

        it('should return 403 if user is blocked during refresh', async () => {
            const blockedUser = await models.User.create({
                login: 'blockedonrefresh',
                password_hash: 'hash',
                role_id: 1,
                is_blocked: true
            });
            const refreshToken = jwt.sign({
                sub: blockedUser.id,
                login: blockedUser.login,
                role_id: blockedUser.role_id,
            }, process.env.JWT_REFRESH_SECRET);

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', [`refreshToken=${refreshToken}`]);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Ваш аккаунт заблокирован');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear cookies on logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Успешный выход из системы');
            // Check if cookies are set to expire
            const cookies = res.header['set-cookie'];
            expect(cookies.some(c => c.includes('accessToken=;'))).toBe(true);
            expect(cookies.some(c => c.includes('refreshToken=;'))).toBe(true);
        });
    });

    it('should return 401 if access token is invalid/expired in protected route', async () => {
        // Это проверит middleware auth
        const res = await request(app)
            .get('/api/user/me')
            .set('Cookie', ['accessToken=invalid_token']);
        
        expect(res.status).toBe(401);
    });

    it('should return 401 if refresh token is missing', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token');
            // Без кук
        expect(res.status).toBe(401);
    });
});
