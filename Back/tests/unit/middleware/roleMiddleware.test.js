const { isAdmin, isOrganizer } = require('../../../middleware/roleMiddleware');
const jwt = require('jsonwebtoken');
const models = require('../../../models');

jest.mock('../../../models');
jest.mock('jsonwebtoken');

describe('RoleMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('isAdmin', () => {
        it('should return 401 if no access token', async () => {
            await isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 403 if user is not admin', async () => {
            req.cookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue({ sub: 1 });
            models.User.findByPk.mockResolvedValue({ id: 1, role_id: 1 });

            await isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Нет прав для доступа к этому ресурсу' });
        });

        it('should call next if user is admin', async () => {
            req.cookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue({ sub: 1 });
            models.User.findByPk.mockResolvedValue({ id: 1, role_id: 3 });

            await isAdmin(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('isOrganizer', () => {
        it('should return 403 if user is just regular user', async () => {
            req.cookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue({ sub: 1 });
            models.User.findByPk.mockResolvedValue({ id: 1, role_id: 1 });

            await isOrganizer(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should call next if user is organizer', async () => {
            req.cookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue({ sub: 1 });
            models.User.findByPk.mockResolvedValue({ id: 1, role_id: 2 });

            await isOrganizer(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should call next if user is admin', async () => {
            req.cookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue({ sub: 1 });
            models.User.findByPk.mockResolvedValue({ id: 1, role_id: 3 });

            await isOrganizer(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
