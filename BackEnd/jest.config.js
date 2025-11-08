export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/**/__tests__/**/*.js'],
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
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
    './controllers/': {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15,
    },
    './utils/': {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Use babel-jest to transform ESM test files
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}
