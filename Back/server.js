// index.js
const app = require('./app');
const sequelize = require('./config/db');
const { exec } = require('child_process'); // Для выполнения команд CLI
const PORT = process.env.PORT || 5000;

// Функция для проверки пустой базы данных (опционально)
async function isDatabaseEmpty(sequelize) {
  const [results] = await sequelize.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public');"
  );
  return !results[0].exists;
}

// Запуск миграций и seeder'ов
isDatabaseEmpty(sequelize).then((isEmpty) => {
  if (isEmpty) {
    exec('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all', (err, stdout, stderr) => {
      if (err) {
        console.error('Ошибка миграций или seeder\'ов:', stderr);
        process.exit(1);
      }
      console.log('Миграции и seeder\'ы выполнены:', stdout);
      app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
      });
    });
  } else {
    // Если база не пуста, просто запускаем сервер
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  }
}).catch((err) => {
  console.error('Ошибка проверки базы данных:', err);
  process.exit(1);
});