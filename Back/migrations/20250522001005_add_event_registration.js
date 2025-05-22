const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "eventregistrations", deps: [users, events, statuses]
 *
 */

const info = {
  revision: 8,
  name: "add_event_registration",
  created: "2025-05-21T22:43:44.320Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "eventregistrations",
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
        status_id: {
          type: Sequelize.INTEGER,
          field: "status_id",
          references: { model: "statuses", key: "id" },
          allowNull: false,
        },
        telegram_invite_link: {
          type: Sequelize.STRING,
          field: "telegram_invite_link",
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
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
    params: ["eventregistrations", { transaction }],
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
