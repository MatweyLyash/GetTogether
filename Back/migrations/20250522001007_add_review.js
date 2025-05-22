const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "reviews", deps: [users, events]
 *
 */

const info = {
  revision: 10,
  name: "add_review",
  created: "2025-05-21T22:47:31.385Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "reviews",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          field: "user_id",
          references: { model: "users", key: "id" },
          allowNull: false,
        },
        event_id: {
          type: Sequelize.INTEGER,
          field: "event_id",
          references: { model: "events", key: "id" },
          allowNull: false,
        },
        rating: { type: Sequelize.INTEGER, field: "rating", allowNull: false },
        comment: { type: Sequelize.TEXT, field: "comment" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["reviews", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};
