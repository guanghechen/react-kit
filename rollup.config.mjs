import { createRollupConfig, tsPresetConfigBuilder } from '@guanghechen/rollup-config'
import path from 'node:path'

export default async function rollupConfig() {
  const sourcemapFromCLI = process.argv
  .filter(arg => arg.startsWith('--sourcemap='))
  .map(arg => arg.split('=')[1])
  const sourcemap = sourcemapFromCLI.length > 0 ? sourcemapFromCLI[0] === 'true' : false

  const { default: manifest } = await import(path.resolve('package.json'), {
    with: { type: 'json' },
  })
  const config = await createRollupConfig({
    manifest,
    env: { sourcemap },
    presetConfigBuilders: [
      tsPresetConfigBuilder({
        typescriptOptions: {
          tsconfig: 'tsconfig.src.json',
          compilerOptions: {
            moduleResolution: 'node',
          },
        },
      }),
    ],
  })
  return config
}
