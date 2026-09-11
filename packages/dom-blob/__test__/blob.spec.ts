import { afterEach, describe, expect, it, vi } from 'vitest'
import { convertDataURLToBlob } from '../src/convert'
import { downloadBlob } from '../src/download'

afterEach(() => vi.unstubAllGlobals())

describe('convertDataURLToBlob', () => {
  it.each([
    ['data:text/plain,a,b', 'text/plain', [97, 44, 98]],
    ['data:application/octet-stream,%FF%00', 'application/octet-stream', [255, 0]],
    ['data:text/plain;base64,SGk%3D', 'text/plain', [72, 105]],
    ['data:text/plain;base64,SGk=', 'text/plain', [72, 105]],
    ['data:,hello', '', [104, 101, 108, 108, 111]],
    ['data:text/plain,a#b', 'text/plain', [97, 35, 98]],
    ['data:text/plain,%ZZ%2Z%2', 'text/plain', [...new TextEncoder().encode('%ZZ%2Z%2')]],
    ['data:text/plain,%E4%B8%AD文', 'text/plain', [...new TextEncoder().encode('中文')]],
    ['data:text/plain,%af%AF', 'text/plain', [175, 175]],
    ['data:text/plain,', 'text/plain', []],
  ])('preserves payload bytes for %s', async (url, type, bytes) => {
    const blob = convertDataURLToBlob(url as string)
    expect(blob.type).toBe(type)
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual(bytes)
  })

  it('rejects missing separators and invalid base64', () => {
    expect(() => convertDataURLToBlob('data:text/plain')).toThrow(TypeError)
    expect(() => convertDataURLToBlob('data:text/plain;base64,%%%')).toThrow()
  })
})

describe('downloadBlob', () => {
  it('delegates to the legacy browser API when available', () => {
    const msSaveBlob = vi.fn()
    vi.stubGlobal('window', { navigator: { msSaveBlob } })
    const blob = new Blob(['hello'])
    downloadBlob(blob, 'hello.txt')
    expect(msSaveBlob).toHaveBeenCalledWith(blob, 'hello.txt')
  })

  it.each([false, true])('cleans up the anchor and URL when click throws: %s', throws => {
    const anchor = {
      style: { display: '' },
      href: '',
      setAttribute: vi.fn(),
      click: vi.fn(() => {
        if (throws) throw new Error('Download failed')
      }),
    }
    const body = { appendChild: vi.fn(), removeChild: vi.fn() }
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('window', { navigator: {}, URL: { createObjectURL, revokeObjectURL } })
    vi.stubGlobal('document', { createElement: vi.fn(() => anchor), body })
    const blob = new Blob(['hello'])
    if (throws) expect(() => downloadBlob(blob, 'hello.txt')).toThrow('Download failed')
    else downloadBlob(blob, 'hello.txt')
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(anchor.href).toBe('blob:test')
    expect(anchor.setAttribute).toHaveBeenCalledWith('download', 'hello.txt')
    expect(body.appendChild).toHaveBeenCalledWith(anchor)
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(body.removeChild).toHaveBeenCalledWith(anchor)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
