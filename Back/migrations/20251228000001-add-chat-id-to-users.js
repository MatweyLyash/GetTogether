'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'chat_id', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'chat_id');
    }
};
