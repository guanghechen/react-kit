/**
 * Creates and returns a blob from a data URL (either base64 encoded or not).
 *
 * @param {string} dataURL The data URL to convert.
 * @return {Blob} A blob representing the array buffer data.
 * @see https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
 */
export function convertDataURLToBlob(dataURL: string): Blob {
  const commaIndex = dataURL.indexOf(',')
  if (commaIndex === -1) {
    throw new TypeError('Expected a comma separator')
  }

  let contentType = dataURL.slice(0, commaIndex).split(':')[1]
  const base64 = contentType.endsWith(';base64')
  if (base64) contentType = contentType.slice(0, -7)

  const payload = dataURL.slice(commaIndex + 1)
  if (base64) {
    const encodedBase64 = payload.replace(/%([\da-f]{2})/gi, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    const binary = atob(encodedBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; ++i) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: contentType })
  }

  // Percent escapes represent bytes, which need not form valid UTF-8.
  const encoded = new TextEncoder().encode(payload)
  const decoded = new Uint8Array(encoded.length)
  let length = 0
  for (let i = 0; i < encoded.length; ++i) {
    let byte = encoded[i]
    if (byte === 0x25 && i + 2 < encoded.length) {
      const high = decodeHexDigit(encoded[i + 1])
      const low = decodeHexDigit(encoded[i + 2])
      if (high !== -1 && low !== -1) {
        byte = (high << 4) | low
        i += 2
      }
    }
    decoded[length] = byte
    length += 1
  }

  return new Blob([decoded.subarray(0, length)], { type: contentType })
}

function decodeHexDigit(byte: number): number {
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30
  const lower = byte | 0x20
  if (lower >= 0x61 && lower <= 0x66) return lower - 0x61 + 10
  return -1
}
