const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * changeColumn(category_id) => "events"
 * changeColumn(creator_id) => "events"
 * changeColumn(status_id) => "eventregistrations"
 * changeColumn(event_id) => "eventregistrations"
 * changeColumn(user_id) => "eventregistrations"
 * changeColumn(status_id) => "organizerrequests"
 * changeColumn(user_id) => "organizerrequests"
 * changeColumn(event_id) => "reviews"
 * changeColumn(user_id) => "reviews"
 * changeColumn(role_id) => "users"
 *
 */

const info = {
  revision: 11,
  name: "rename_col_event",
  created: "2025-05-21T23:59:18.523Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "changeColumn",
    params: [
      "events",
      "category_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "category_id",
        references: { model: "categories", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "events",
      "creator_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "creator_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "status_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "status_id",
        references: { model: "statuses", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "event_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "event_id",
        references: { model: "events", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "user_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "organizerrequests",
      "status_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "status_id",
        references: { model: "statuses", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "organizerrequests",
      "user_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "reviews",
      "event_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "event_id",
        references: { model: "events", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "reviews",
      "user_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "users",
      "role_id",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        field: "role_id",
        references: { model: "roles", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "changeColumn",
    params: [
      "events",
      "category_id",
      {
        type: Sequelize.INTEGER,
        field: "category_id",
        references: { model: "categories", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "events",
      "creator_id",
      {
        type: Sequelize.INTEGER,
        field: "creator_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "status_id",
      {
        type: Sequelize.INTEGER,
        field: "status_id",
        references: { model: "statuses", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "event_id",
      {
        type: Sequelize.INTEGER,
        field: "event_id",
        references: { model: "events", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "eventregistrations",
      "user_id",
      {
        type: Sequelize.INTEGER,
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "organizerrequests",
      "status_id",
      {
        type: Sequelize.INTEGER,
        field: "status_id",
        references: { model: "statuses", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "organizerrequests",
      "user_id",
      {
        type: Sequelize.INTEGER,
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "reviews",
      "event_id",
      {
        type: Sequelize.INTEGER,
        field: "event_id",
        references: { model: "events", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "reviews",
      "user_id",
      {
        type: Sequelize.INTEGER,
        field: "user_id",
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "users",
      "role_id",
      {
        type: Sequelize.INTEGER,
        field: "role_id",
        references: { model: "roles", key: "id" },
        allowNull: false,
      },
      { transaction },
    ],
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
