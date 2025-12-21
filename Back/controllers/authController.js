const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const models = require('../models');

class AuthController {
  async register(req, res, next) {
    const { login, password } = req.body;

    try {
      const existingUser = await models.User.findOne({ where: { login } });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await models.User.create({ role_id: 1, password_hash, login });

      // Generate tokens with extended payload
      const accessToken = jwt.sign({
        sub: user.id,
        login: user.login,
        role_id: user.role_id,
      }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign({
        sub: user.id,
        login: user.login,
        role_id: user.role_id,
      }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true, // Always secure for HTTPS
        sameSite: 'none', // Required for cross-origin (different ports)
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Always secure for HTTPS
        sameSite: 'none', // Required for cross-origin (different ports)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: user.id,
          login: user.login,
          role_id: user.role_id,
          telegram: user.telegram
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при регистрации', error: error.message });
    }
  }

  async authenticate(req, res) {
    const { login, password } = req.body;

    try {
      const user = await models.User.findOne({ where: { login } });
      if (!user) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      if (user.is_blocked) {
        return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      // Generate tokens with extended payload
      const accessToken = jwt.sign({
        sub: user.id, // Заменяем userId на sub
        login: user.login,
        role_id: user.role_id,
      }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign({
        sub: user.id, // Заменяем userId на sub
        login: user.login,
        role_id: user.role_id,
      }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true, // Always secure for HTTPS
        sameSite: 'none', // Required for cross-origin (different ports)
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Always secure for HTTPS
        sameSite: 'none', // Required for cross-origin (different ports)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        message: 'Успешная авторизация',
        user: {
          id: user.id,
          login: user.login,
          role_id: user.role_id,
          telegram: user.telegram
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при авторизации', error: error.message });
    }
  }

  async refreshToken(req, res) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Отсутствует refresh токен' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await models.User.findByPk(decoded.sub); // Заменяем decoded.userId на decoded.sub

      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      if (user.is_blocked) {
        return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
      }

      // Generate new access token with extended payload
      const accessToken = jwt.sign({
        sub: user.id, // Заменяем userId на sub
        login: user.login,
        role_id: user.role_id,
      }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true, // Always secure for HTTPS
        sameSite: 'none', // Required for cross-origin (different ports)
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.status(200).json({ message: 'Токен успешно обновлен' });
    } catch (error) {
      return res.status(401).json({ message: 'Недействительный refresh токен' });
    }
  }



  async logout(req, res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Успешный выход из системы' });
  }
}

module.exports = new AuthController();