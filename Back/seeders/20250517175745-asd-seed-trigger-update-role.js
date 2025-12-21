'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_user_role_on_organizer_request()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.status_id = 2 THEN
              UPDATE Users
              SET role_id = 2,
                  "updatedAt" = CURRENT_TIMESTAMP
              WHERE id = NEW.user_id;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER organizer_request_role_trigger
      AFTER UPDATE OF status_id
      ON organizerrequests
      FOR EACH ROW
      EXECUTE FUNCTION update_user_role_on_organizer_request();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS organizer_request_role_trigger ON organizerrequests;
      DROP FUNCTION IF EXISTS update_user_role_on_organizer_request;
    `);
  }
};