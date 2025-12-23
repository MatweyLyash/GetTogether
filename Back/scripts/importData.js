#!/usr/bin/env node
/**
 * Импорт данных из JSON в БД (PostgreSQL).
 *
 * Запуск:
 *   node scripts/importData.js ./data-export.json
 *
 * Поведение:
 *   - TRUNCATE всех таблиц (CASCADE, RESTART IDENTITY)
 *   - bulkCreate данных из файла
 *
 * Важно: убедитесь, что .env настроен, и вы готовы потерять текущие данные.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../models');

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error('Укажите путь к JSON: node scripts/importData.js ./data-export.json');
  }

  const json = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const modelsEntries = Object.entries(db).filter(
    ([name, value]) => typeof value === 'function' && value.name !== 'Sequelize'
  );

  const tableNames = modelsEntries
    .map(([_, model]) => (typeof model.getTableName === 'function' ? model.getTableName() : null))
    .filter(Boolean);

  // ПРАВИЛЬНЫЙ ПОРЯДОК (от независимых к зависимым)
  const orderedModelNames = [
    'Role',
    'Status',
    'Category', // Категории должны быть раньше Событий и Достижений
    'Tag',      // Теги - независимая сущность
    'User',
    'Event',    // События после пользователей и категорий
    'EventTag', // Связь мероприятий и тегов
    'Achievement', // Достижения после категорий и событий (так как могут ссылаться на них)
    'UserAchievement',
    'OrganizerRequest',
    'EventSubscription',
    'EventRegistration',
    'Review',
    'PushSubscription',
  ];

  const modelMap = Object.fromEntries(modelsEntries);
  const orderedModels = [];

  for (const name of orderedModelNames) {
    if (modelMap[name]) orderedModels.push([name, modelMap[name]]);
  }
  for (const [name, model] of modelsEntries) {
    if (!orderedModelNames.includes(name)) {
      orderedModels.push([name, model]);
    }
  }

  const usersSet = new Set((json.User || []).map((r) => r.id));
  const eventsSet = new Set((json.Event || []).map((r) => r.id));
  const statusesSet = new Set((json.Status || []).map((r) => r.id));
  const categoriesSet = new Set((json.Category || []).map((r) => r.id));
  const tagsSet = new Set((json.Tag || []).map((r) => r.id));
  const achievementsSet = new Set((json.Achievement || []).map((r) => r.id));

  const reviveBuffers = (row) => {
    if (!row || typeof row !== 'object') return row;
    const copy = { ...row };
    for (const [k, v] of Object.entries(copy)) {
      if (v && typeof v === 'object' && v.type === 'Buffer' && Array.isArray(v.data)) {
        copy[k] = Buffer.from(v.data);
      }
      if (typeof v === 'string' && v.startsWith('data:')) {
        try {
          const base64 = v.split(',')[1];
          copy[k] = Buffer.from(base64, 'base64');
        } catch (_) { }
      }
    }
    return copy;
  };

  const filterRows = (modelName, rows) => {
    if (!Array.isArray(rows)) return [];

    switch (modelName) {
      case 'User':
        // Убеждаемся, что роли существуют, если в базе есть такая связь
        return rows;
      case 'Event':
        return rows.filter((r) => usersSet.has(r.creator_id) && categoriesSet.has(r.category_id));
      case 'Achievement':
        // Достижение может иметь null в условиях, проверяем только если ID указан
        return rows.filter((r) => {
          const catOk = !r.condition_category_id || categoriesSet.has(r.condition_category_id);
          const evtOk = !r.condition_event_id || eventsSet.has(r.condition_event_id);
          return catOk && evtOk;
        });
      case 'EventRegistration':
        return rows.filter(
          (r) => usersSet.has(r.user_id) && eventsSet.has(r.event_id) && statusesSet.has(r.status_id)
        );
      case 'OrganizerRequest':
        return rows.filter((r) => usersSet.has(r.user_id) && statusesSet.has(r.status_id));
      case 'Review':
        return rows.filter((r) => usersSet.has(r.user_id) && eventsSet.has(r.event_id));
      case 'UserAchievement':
        return rows.filter((r) => usersSet.has(r.user_id) && achievementsSet.has(r.achievement_id));
      case 'EventTag':
        return rows.filter((r) => eventsSet.has(r.event_id) && tagsSet.has(r.tag_id));
      default:
        return rows;
    }
  };

  const transaction = await db.sequelize.transaction();
  try {
    console.log('Очистка таблиц...');
    for (const table of tableNames) {
      await db.sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`, { transaction });
    }

    for (const [modelName, model] of orderedModels) {
      if (!json[modelName] || !Array.isArray(json[modelName])) {
        console.log(`Пропуск ${modelName}: данных нет в JSON`);
        continue;
      }

      const rows = filterRows(modelName, json[modelName]).map(reviveBuffers);
      if (!rows.length) {
        console.log(`Пропуск ${modelName}: 0 строк после фильтрации`);
        continue;
      }

      console.log(`Импорт ${modelName}: ${rows.length} строк`);
      await model.bulkCreate(rows, {
        validate: false,
        returning: false,
        transaction,
      });
    }

    await transaction.commit();
    console.log(`✅ Импорт успешно завершён!`);
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Ошибка во время транзакции. Откат данных.');
    throw err;
  } finally {
    await db.sequelize.close();
  }
}

main().catch((err) => {
  console.error('❌ Критическая ошибка импорта:', err);
  process.exit(1);
});
