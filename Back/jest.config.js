module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/setup.js',
        '/tests/factories/'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    setupFilesAfterEnv: ['./tests/setup.js'],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000
};
