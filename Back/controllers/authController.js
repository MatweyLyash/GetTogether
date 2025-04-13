const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  async register(req, res, next) {
    const { role_id, telegram, login, password } = req.body;
    console.log(role_id);

    try {
      const existingUser = await User.findOne({ where: { telegram } });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await User.create({ role_id, password_hash, telegram, login });

      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.status(201).json({ 
        message: 'Пользователь успешно зарегистрирован', 
        user: {
          id: user.id,
          login: user.login,
          role_id: user.role_id,
          telegram: user.telegram
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при регистрации', error: error.message });
    }
  }

  async authenticate(req, res) {
    const { login, password } = req.body;

    try {
      const user = await User.findOne({ where: { login } });
      if (!user) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      // Check if account is blocked
      if (user.is_blocked) {
        return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.status(200).json({ 
        message: 'Успешная авторизация', 
        user: {
          id: user.id,
          login: user.login,
          role_id: user.role_id,
          telegram: user.telegram
        },
        token 
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при авторизации', error: error.message });
    }
  }
}
module.exports.controller = new AuthController();