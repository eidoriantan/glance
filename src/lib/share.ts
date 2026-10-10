// Shareable links keep the document in the URL fragment (#md=...), which
// browsers never send to a server, so sharing stays fully client-side.

const PARAM = 'md'

/** Longest compressed payload we put in a link. Keeps URLs usable in chat apps and email. */
export const MAX_SHARE_LENGTH = 8000

/** Upper bound when decoding, so a crafted link can't decompress into something huge. */
const MAX_DECODED_BYTES = 512 * 1024

async function readAll(stream: ReadableStream<Uint8Array>, limit = Infinity): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > limit) {
      await reader.cancel()
      throw new Error('Shared document is too large')
    }
    chunks.push(value)
  }
  const out = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export async function encodeShare(markdown: string): Promise<string> {
  const input = new Blob([markdown]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return toBase64Url(await readAll(input))
}

export async function decodeShare(payload: string): Promise<string> {
  const input = new Blob([fromBase64Url(payload) as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new TextDecoder().decode(await readAll(input, MAX_DECODED_BYTES))
}

/** The compressed payload in the current URL, if any. */
export function sharePayloadFromHash(hash = window.location.hash): string | null {
  return new URLSearchParams(hash.replace(/^#/, '')).get(PARAM)
}

export function buildShareUrl(payload: string): string {
  const url = new URL(window.location.href)
  url.hash = `${PARAM}=${payload}`
  return url.toString()
}
