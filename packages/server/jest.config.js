module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  passWithNoTests: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/integration/**', // Exclude integration tests from coverage
  ],
  moduleNameMapper: {
    '^@fusion-tic-tac-toe/shared$': '<rootDir>/../shared/src',
  },
  testTimeout: 30000, // Longer timeout for integration tests
};

