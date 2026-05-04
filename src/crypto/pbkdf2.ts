import { bufferToBase64, base64ToBuffer } from '@/utils/base64'

const ITERATIONS = 310_000
const KEY_LENGTH = 256

export async function deriveWrappingKey(
  password: string,
  salt: BufferSource
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  password: string
): Promise<{ wrappedPrivateKey: string; pbkdf2Salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const wrappingKey = await deriveWrappingKey(password, salt)

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrapped = await crypto.subtle.wrapKey('pkcs8', privateKey, wrappingKey, { name: 'AES-GCM', iv })

  const combined = new Uint8Array(iv.byteLength + wrapped.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(wrapped), iv.byteLength)

  return {
    wrappedPrivateKey: bufferToBase64(combined.buffer as ArrayBuffer),
    pbkdf2Salt: bufferToBase64(salt.buffer as ArrayBuffer),
  }
}

export async function unwrapPrivateKey(
  wrappedPrivateKeyB64: string,
  pbkdf2SaltB64: string,
  password: string
): Promise<CryptoKey> {
  const combined = new Uint8Array(base64ToBuffer(wrappedPrivateKeyB64))
  const iv = combined.slice(0, 12)
  const wrappedKey = combined.slice(12)

  const salt = base64ToBuffer(pbkdf2SaltB64)
  const wrappingKey = await deriveWrappingKey(password, salt)

  return crypto.subtle.unwrapKey(
    'pkcs8',
    wrappedKey,
    wrappingKey,
    { name: 'AES-GCM', iv },
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt', 'unwrapKey']
  )
}
