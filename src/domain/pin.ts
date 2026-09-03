/** PIN: validare, derivare PBKDF2-SHA256 și verificare în timp constant. */

export const PIN_ITERATIONS = 100_000
const SALT_BYTES = 16
const KEY_BITS = 256

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}

function toBase64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

async function derive(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto.subtle
  const material = await subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: PIN_ITERATIONS },
    material,
    KEY_BITS,
  )
  return new Uint8Array(bits)
}

export async function hashPin(pin: string, saltB64?: string): Promise<{ hash: string; salt: string }> {
  if (!isValidPin(pin)) throw new Error('PIN-ul trebuie să aibă între 4 și 6 cifre')
  const salt = saltB64 ? fromBase64(saltB64) : globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derive(pin, salt)
  return { hash: toBase64(hash), salt: toBase64(salt) }
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}

export async function verifyPin(pin: string, hashB64: string, saltB64: string): Promise<boolean> {
  if (!isValidPin(pin)) return false
  const candidate = await derive(pin, fromBase64(saltB64))
  return constantTimeEqual(candidate, fromBase64(hashB64))
}

/** Întârziere progresivă după încercări greșite: 0 pentru primele 3, apoi 2s, 4s, 8s... plafon 30s. */
export function failureDelayMs(failedAttempts: number): number {
  if (failedAttempts < 3) return 0
  return Math.min(30_000, 2000 * 2 ** (failedAttempts - 3))
}
