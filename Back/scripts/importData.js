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

  // Задаём порядок импорта, чтобы не ломать внешние ключи
  const orderedModelNames = [
    'Role',
    'Status',
    'User',
    'Category',
    'Event',
    'OrganizerRequest',
    'EventSubscription',
    'EventRegistration',
    'Review',
    'PushSubscription',
  ];

  // Формируем итоговый порядок моделей: сначала по списку, потом остальные
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

  // Подготовим множества для валидации внешних ключей
  const usersSet = new Set((json.User || []).map((r) => r.id));
  const eventsSet = new Set((json.Event || []).map((r) => r.id));
  const statusesSet = new Set((json.Status || []).map((r) => r.id));
  const categoriesSet = new Set((json.Category || []).map((r) => r.id));

  const reviveBuffers = (row) => {
    if (!row || typeof row !== 'object') return row;
    const copy = { ...row };
    for (const [k, v] of Object.entries(copy)) {
      if (v && typeof v === 'object' && v.type === 'Buffer' && Array.isArray(v.data)) {
        copy[k] = Buffer.from(v.data);
      }
    }
    return copy;
  };

  const filterRows = (modelName, rows) => {
    if (!Array.isArray(rows)) return [];

    // Фильтруем потенциально проблемные таблицы, чтобы не падать на FK
    switch (modelName) {
      case 'EventRegistration':
        return rows.filter(
          (r) => usersSet.has(r.user_id) && eventsSet.has(r.event_id) && statusesSet.has(r.status_id)
        );
      case 'EventSubscription':
        return rows.filter((r) => usersSet.has(r.user_id)); // target_id может быть организатором или категорией; оставляем как есть
      case 'OrganizerRequest':
        return rows.filter((r) => usersSet.has(r.user_id) && statusesSet.has(r.status_id));
      case 'Review':
        return rows.filter((r) => usersSet.has(r.user_id) && eventsSet.has(r.event_id));
      case 'PushSubscription':
        return rows.filter((r) => usersSet.has(r.user_id));
      case 'Event':
        return rows.filter((r) => usersSet.has(r.creator_id) && categoriesSet.has(r.category_id));
      default:
        return rows;
    }
  };

  const transaction = await db.sequelize.transaction();
  try {
    // Чистим таблицы
    for (const table of tableNames) {
      await db.sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`, { transaction });
    }

    // Импортируем данные
    for (const [modelName, model] of orderedModels) {
      if (!json[modelName] || !Array.isArray(json[modelName])) continue;
      if (!model.bulkCreate) continue;

      const rows = filterRows(modelName, json[modelName]).map(reviveBuffers);
      if (!rows.length) continue;

      await model.bulkCreate(rows, {
        validate: false,
        returning: false,
        transaction,
      });
    }

    await transaction.commit();
    console.log(`✅ Импорт завершён из файла: ${inputPath}`);
  } catch (err) {
    await transaction.rollback();
    throw err;
  } finally {
    await db.sequelize.close();
  }
}

main().catch((err) => {
  console.error('❌ Ошибка импорта:', err);
  process.exit(1);
});

