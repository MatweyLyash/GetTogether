const jwt = require('jsonwebtoken');
const models = require('../models/relations');

const auth = async (req, res, next) => {
    try {
        // Get access token from cookies
        const accessToken = req.cookies?.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: 'Отсутствует токен авторизации' });
        }

        // Verify access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        // Check if user exists
        const user = await models.User.findByPk(decoded.sub); // Заменяем decoded.userId на decoded.sub
        
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }
        
        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
        }

        // Add user info to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Токен истек' });
        }
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ error: 'Недействительный токен' });
    }
};

module.exports = auth;