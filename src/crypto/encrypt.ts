import { bufferToBase64 } from '@/utils/base64'
import type { EncryptedPayload } from '@/types/crypto'

export async function encryptMessage(
  plaintext: string,
  recipientPublicKey: CryptoKey,
  senderPublicKey: CryptoKey
): Promise<EncryptedPayload> {
  const enc = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(plaintext)
  )

  const [encryptedKeyBuffer, encryptedKeyForSelfBuffer] = await Promise.all([
    crypto.subtle.wrapKey('raw', aesKey, recipientPublicKey, { name: 'RSA-OAEP' }),
    crypto.subtle.wrapKey('raw', aesKey, senderPublicKey, { name: 'RSA-OAEP' }),
  ])

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv.buffer),
    encryptedKey: bufferToBase64(encryptedKeyBuffer),
    encryptedKeyForSelf: bufferToBase64(encryptedKeyForSelfBuffer),
  }
}
