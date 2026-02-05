module.exports = {
  displayName: 'sdk-tests',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Alias for SDK source
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'], // Custom setup file
  maxWorkers: 1, // Integration tests often need to run sequentially
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 60000, // 60 seconds timeout for integration tests
};
