// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')

const baseConfig = tsMonorepoConfig(__dirname)

module.exports = {
  ...baseConfig,
  collectCoverageFrom: [...(baseConfig.collectCoverageFrom ?? [])],
  coveragePathIgnorePatterns: [],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    ...(baseConfig.moduleNameMapper ?? {}),
  },
  setupFiles: [...(baseConfig.setupFiles ?? [])],
  transform: {
    ...(baseConfig.transform ?? {}),
  },
}