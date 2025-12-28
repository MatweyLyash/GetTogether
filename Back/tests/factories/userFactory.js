const bcrypt = require('bcryptjs');
const models = require('../../models');

const createUser = async (overrides = {}) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(overrides.password || 'password123', salt);

    // Используем уникальный логин с timestamp и random, чтобы избежать коллизий
    const uniqueLogin = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
        return await models.User.create({
            login: uniqueLogin,
            password_hash,
            role_id: 1, // Предполагаем, что роль User (id=1) существует
            ...overrides
        });
    } catch (error) {
        console.error('========================================');
        console.error('CRITICAL FACTORY ERROR: Failed to create user');
        console.error('Message:', error.message);
        // Выводим детали SQL ошибки (важно для Foreign Key / Validation ошибок)
        if (error.parent) {
             console.error('SQL Error:', error.parent.detail || error.parent.message);
             console.error('Table:', error.parent.table);
        }
        if (error.errors) {
            error.errors.forEach(e => console.error('Validation Error:', e.message, 'Value:', e.value));
        }
        console.error('Payload:', { role_id: 1, ...overrides, login: 'GENERATED' });
        console.error('========================================');
        throw error;
    }
};

module.exports = {
    createUser
};