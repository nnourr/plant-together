/** @type {import('ts-jest').JestConfigWithTsJest} */
// jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: ['**/dist/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,
};
