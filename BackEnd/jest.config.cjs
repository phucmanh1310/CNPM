const path = require('path')
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [path.join(__dirname, 'tests', 'setup.js')],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/**/__tests__/**/*.js'],
  moduleFileExtensions: ['cjs', 'js', 'json', 'node'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'middlewares/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 15, functions: 15, lines: 15, statements: 15 },
    './controllers/': {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
    './utils/': { branches: 4, functions: 5, lines: 5, statements: 5 },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  testEnvironmentOptions: { customExportConditions: ['node', 'node-addons'] },
}
