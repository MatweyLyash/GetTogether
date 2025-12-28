const { mockDeep } = require('jest-mock-extended');

const mockTelegramBot = mockDeep();

// Use jest.mock() in specific tests to use this
module.exports = mockTelegramBot;
