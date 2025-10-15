module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@database$': '<rootDir>/src/database/connection.ts',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@config$': '<rootDir>/src/config/config.ts',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@utils$': '<rootDir>/src/utils.ts',
    '^utils$': '<rootDir>/src/utils.ts',
  },
};