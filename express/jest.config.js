/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  testEnvironment: 'node',
  testMatch: ['**/dist/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,

  reporters: ['default', ['jest-junit', {
    outputDirectory: 'test-results',
    outputName: 'jest-junit.xml',
    suiteName: 'Jest Tests',
    classNameTemplate: '{classname}',
    titleTemplate: '{title}',
    ancestorSeparator: ' > ',
    usePathForSuiteName: 'true',
  }]],
};
