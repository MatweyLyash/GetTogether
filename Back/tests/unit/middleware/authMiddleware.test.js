const authMiddleware = require('../../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const models = require('../../../models');

jest.mock('../../../models');
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
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

    it('should return 401 if no access token is provided', async () => {
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Отсутствует токен авторизации' });
    });

    it('should return 401 if token validation fails', async () => {
        req.cookies.accessToken = 'invalid-token';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Недействительный токен' });
    });

    it('should return 401 if token is expired', async () => {
        req.cookies.accessToken = 'expired-token';
        const expiredError = new Error('Token expired');
        expiredError.name = 'TokenExpiredError';
        jwt.verify.mockImplementation(() => {
            throw expiredError;
        });

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Токен истек' });
    });

    it('should return 401 if user is not found', async () => {
        req.cookies.accessToken = 'valid-token';
        jwt.verify.mockReturnValue({ sub: 1 });
        models.User.findByPk.mockResolvedValue(null);

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('should return 403 if user is blocked', async () => {
        req.cookies.accessToken = 'valid-token';
        jwt.verify.mockReturnValue({ sub: 1 });
        models.User.findByPk.mockResolvedValue({ id: 1, is_blocked: true });

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Ваш аккаунт заблокирован' });
    });

    it('should call next() and set req.user if token is valid', async () => {
        const mockUser = { id: 1, login: 'testuser', is_blocked: false };
        req.cookies.accessToken = 'valid-token';
        jwt.verify.mockReturnValue({ sub: 1 });
        models.User.findByPk.mockResolvedValue(mockUser);

        await authMiddleware(req, res, next);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });
});
