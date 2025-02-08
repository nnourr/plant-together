/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Gets all .js tests
    '^(\\.{1,2}/.*)\\.ts$': '$1', // Gets all .ts tests 
  },
  testEnvironment: "node",
  testMatch: [
    "**/__tests__/**/*.test.ts"
  ],
  verbose: true
};
