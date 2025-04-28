/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // Use the ESM preset for ts-jest
  testEnvironment: 'node',
  testMatch: ['**/dist/**/*.test.js'], // Or change to ['**/src/**/*.test.ts'] if you want to run tests on source files
  collectCoverageFrom: ['src/**/*.ts'],
  extensionsToTreatAsEsm: ['.ts'], // Ensure ts files are treated as ESM
  globals: {
    'ts-jest': {
      useESM: true, // Let ts-jest know you're using ESM modules
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Map imports ending in .js to their .ts counterparts
  },
  verbose: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/__tests__/__mocks__/*'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'jest-junit.xml',
        suiteName: 'Jest Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
}
