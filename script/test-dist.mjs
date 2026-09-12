import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const packagesDir = path.join(root, 'packages')

for (const name of fs.readdirSync(packagesDir)) {
  const packageDir = path.join(packagesDir, name)
  const manifestPath = path.join(packageDir, 'package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const esm = await import(pathToFileURL(path.resolve(packageDir, manifest.exports.import)).href)
  const cjs = createRequire(manifestPath)(manifest.name)
  const exportedNames = Object.keys(esm).sort()
  assert.ok(exportedNames.length > 0, `${manifest.name}: missing ESM exports`)
  assert.deepEqual(
    Object.keys(cjs)
      .filter(key => key !== '__esModule')
      .sort(),
    exportedNames,
    `${manifest.name}: ESM and CJS exports must agree`,
  )

  const consumerDir = fs.mkdtempSync(path.join(packageDir, '.tsdown-consumer-'))
  try {
    const consumerPath = path.join(consumerDir, 'index.mts')
    let consumer = `import { ${exportedNames.join(', ')} } from '${manifest.name}'\n`
    consumer += `export { ${exportedNames.join(', ')} }\n`
    if (name === 'react-hooks') {
      consumer += '// @ts-expect-error Internal helper types must not become public exports.\n'
      consumer += "import type { ICallback } from '@guanghechen/react-hooks'\n"
    }
    fs.writeFileSync(consumerPath, consumer)
    const result = spawnSync(
      'tsc',
      [
        '--ignoreConfig',
        '--noEmit',
        '--strict',
        '--target',
        'esnext',
        '--module',
        'nodenext',
        consumerPath,
      ],
      { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' },
    )
    assert.ifError(result.error)
    assert.equal(result.status, 0, `${manifest.name}: ${result.stdout}${result.stderr}`)
  } finally {
    fs.rmSync(consumerDir, { recursive: true, force: true })
  }

  if (name === 'common-util') {
    for (const module of [esm, cjs]) {
      const debounced = module.debounce(value => value * 2, 100)
      debounced(3)
      assert.equal(debounced.flush(), 6)
      debounced.cancel()
    }
  }
  if (name === 'dom-blob') {
    for (const module of [esm, cjs]) {
      const blob = module.convertDataURLToBlob('data:text/plain;base64,aGk=')
      assert.equal(await blob.text(), 'hi')
    }
  }
  console.log(`${manifest.name}: ESM, CJS, and public declarations passed`)
}
