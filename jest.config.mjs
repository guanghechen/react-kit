import { tsMonorepoConfig } from '@guanghechen/jest-config'
import path from 'node:path'
import url from 'node:url'

export default async function () {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const baseConfig = await tsMonorepoConfig(__dirname, { useESM: true })

  const config = {
    ...baseConfig,
    preset: 'ts-jest/presets/default-esm',
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
    extensionsToTreatAsEsm: ['.ts', '.mts', '.tsx', '.mtsx'],
  }
  return config
}
