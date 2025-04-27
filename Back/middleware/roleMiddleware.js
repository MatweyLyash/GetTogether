const jwt = require('jsonwebtoken');
const models = require('../models/relations');

/**
 * Middleware to check if user has admin role (role_id: 3)
 */
const isAdmin = async (req, res, next) => {
  try {
    // Get access token from cookies
    const accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await models.User.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Check if user is an admin (role_id: 3)
    if (user.role_id !== 3) {
      return res.status(403).json({ message: 'Нет прав для доступа к этому ресурсу' });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек' });
    }
    console.error('Error in admin middleware:', error);
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

/**
 * Middleware to check if user has organizer role (role_id: 2)
 */
const isOrganizer = async (req, res, next) => {
  try {
    // Get access token from cookies
    const accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await models.User.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Check if user is an organizer (role_id: 2) or admin (role_id: 3)
    if (user.role_id !== 2 && user.role_id !== 3) {
      return res.status(403).json({ message: 'Нет прав для доступа к этому ресурсу' });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек' });
    }
    console.error('Error in organizer middleware:', error);
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

module.exports = { isAdmin, isOrganizer };
