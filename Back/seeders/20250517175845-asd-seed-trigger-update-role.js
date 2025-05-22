'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_event_capacity()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.status_id = 2 AND (OLD.status_id IS NULL OR OLD.status_id != 2) THEN
              UPDATE Events
              SET capacity = capacity - 1
              WHERE id = NEW.event_id;
          ELSIF OLD.status_id = 2 AND NEW.status_id IN (1, 3) THEN
              UPDATE Events
              SET capacity = capacity + 1
              WHERE id = NEW.event_id;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER event_capacity_trigger
      AFTER UPDATE ON eventregistrations
      FOR EACH ROW
      EXECUTE FUNCTION update_event_capacity();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS event_capacity_trigger ON eventregistrations;
      DROP FUNCTION IF EXISTS update_event_capacity;
    `);
  }
};