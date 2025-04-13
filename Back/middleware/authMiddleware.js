const jwt = require('jsonwebtoken');
const models = require('../models/relations');

/**
 * Middleware to verify user authentication
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await models.User.findByPk(decoded.userId);
    
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
    console.error('Error in auth middleware:', error);
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

module.exports = auth;
