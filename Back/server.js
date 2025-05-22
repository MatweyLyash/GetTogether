// index.js
const app = require('./app');
const sequelize = require('./config/db');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const PORT = process.env.PORT || 5000;

// Функция для проверки, существует ли пользователь admin
async function isAdminUserMissing(sequelize) {
  try {
    const [results] = await sequelize.query(
      `SELECT 1 FROM users WHERE login = :login LIMIT 1`,
      {
        replacements: { login: 'admin' },
        type: sequelize.QueryTypes.SELECT
      }
    );
    return !results; // true, если пользователь не найден
  } catch (err) {
    // Если таблица users не существует, считаем, что пользователь отсутствует
    if (err.name === 'SequelizeDatabaseError' && err.message.includes('relation "users" does not exist')) {
      return true;
    }
    throw err; // Пробрасываем другие ошибки
  }
}

// Запуск миграций и сидеров
async function initializeDatabase() {
  try {
    // Проверяем наличие пользователя admin
    const adminMissing = await isAdminUserMissing(sequelize);
    console.log('Пользователь admin отсутствует:', adminMissing);

    if (adminMissing) {
      console.log('Запуск миграций и сидеров...');
      const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all');
      if (stderr) {
        console.error('Предупреждения при выполнении миграций/сидеров:', stderr);
      }
      console.log('Миграции и сидеры выполнены:', stdout);
    } else {
      console.log('Пользователь admin уже существует, пропускаем миграции и сидеры.');
    }

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (err) {
    console.error('Ошибка при инициализации базы данных:', err);
    process.exit(1);
  }
}

initializeDatabase();