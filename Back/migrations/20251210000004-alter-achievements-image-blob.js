'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Меняем тип image на BLOB, безопасно конвертируя существующие текстовые данные
    await queryInterface.sequelize.query(`
      ALTER TABLE "achievements"
      ALTER COLUMN "image" TYPE BYTEA
      USING CASE
        WHEN "image" IS NULL THEN NULL
        ELSE convert_to("image", 'UTF8')
      END;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Возврат к строке из bytea
    await queryInterface.sequelize.query(`
      ALTER TABLE "achievements"
      ALTER COLUMN "image" TYPE VARCHAR(1024)
      USING CASE
        WHEN "image" IS NULL THEN NULL
        ELSE convert_from("image", 'UTF8')
      END;
    `);
  },
};


