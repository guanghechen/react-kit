import { tsMonorepoConfig } from '@guanghechen/jest-config'
import path from 'node:path'
import url from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default async function () {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const baseConfig = await tsMonorepoConfig(__dirname, {
    useESM: true,
    tsconfigFilepath: path.join(__dirname, 'tsconfig.test.esm.json'),
  })

  const config = {
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
    extensionsToTreatAsEsm: ['.ts', '.mts', '.tsx', '.mtsx'],
    prettierPath: require.resolve('prettier-2')
  }
  return config
}
