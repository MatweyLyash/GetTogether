const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthController {
    async register(req,res,next) {
        const { role_id, telegram, login, password } = req.body;
        console.log(role_id)
      
        try {
          const existingUser = await User.findOne({ where: { telegram } });
          if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
          }
    
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(password, salt);
      
          const user = await User.create({ role_id, password_hash, telegram, login });
      
          res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user });
        } catch (error) {
          res.status(500).json({ message: 'Ошибка при регистрации', error: error.message });
        }
    }
}

module.exports.controller = new AuthController();