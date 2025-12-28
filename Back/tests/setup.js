require('dotenv').config({ path: '.env.test' });
const models = require('../models');

// Global mocks for external services
jest.mock('../bot/telegramBot', () => ({
    generateInviteLink: jest.fn().mockResolvedValue({ success: true, inviteLink: 'http://t.me/test_invite' }),
    sendNotificationToUser: jest.fn().mockResolvedValue(true),
    bot: {
        onText: jest.fn(),
        on: jest.fn(),
        sendMessage: jest.fn()
    }
}));

jest.mock('../services/webPushService', () => ({
    sendNotification: jest.fn().mockResolvedValue({ success: true }),
    subscribe: jest.fn().mockResolvedValue({ success: true }),
    notifyNewEvent: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../utils/fileUtils', () => ({
    getMimeType: jest.fn().mockResolvedValue('image/gif')
}));

// Global setup before all tests
beforeAll(async () => {
    // In a real scenario, you might want to run migrations here
    // For now, we'll just ensure the connection is working
    try {
        await models.sequelize.authenticate();
        console.log('Test setup: Database connection established');
    } catch (error) {
        console.warn('Test setup: Database connection failed (integration tests might fail):', error.message);
        // We don't exit(1) here to allow pure unit tests to run
    }
});

// Global teardown after all tests
afterAll(async () => {
    await models.sequelize.close();
});
