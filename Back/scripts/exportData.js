#!/usr/bin/env node
/**
 * Экспорт всех таблиц в JSON.
 *
 * Запуск:
 *   node scripts/exportData.js ./data-export.json
 *
 * Требования:
 *   - настроен .env (DB_*)
 *   - установлены зависимости (sequelize, pg)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../models');

async function main() {
  const outputPath = process.argv[2] || 'data-export.json';

  // Список моделей в объекте db (кроме служебных свойств)
  const modelEntries = Object.entries(db).filter(
    ([name, value]) => typeof value === 'function' && value.name !== 'Sequelize'
  );

  const result = {};

  for (const [modelName, model] of modelEntries) {
    if (!model.findAll) continue;
    const rows = await model.findAll({ raw: true });
    result[modelName] = rows;
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✅ Экспорт завершён: ${outputPath}`);
}

main()
  .then(() => db.sequelize.close())
  .catch((err) => {
    console.error('❌ Ошибка экспорта:', err);
    db.sequelize.close();
    process.exit(1);
  });

