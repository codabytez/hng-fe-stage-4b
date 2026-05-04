import { base64ToBuffer } from '@/utils/base64'
import type { EncryptedPayload } from '@/types/crypto'

export async function decryptMessage(
  payload: EncryptedPayload,
  privateKey: CryptoKey,
  isSender: boolean
): Promise<string> {
  const encryptedKeyBuffer = base64ToBuffer(
    isSender ? payload.encryptedKeyForSelf : payload.encryptedKey
  )

  const aesKey = await crypto.subtle.unwrapKey(
    'raw',
    encryptedKeyBuffer,
    privateKey,
    { name: 'RSA-OAEP' },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  const ciphertextBuffer = base64ToBuffer(payload.ciphertext)
  const iv = base64ToBuffer(payload.iv)

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertextBuffer
  )

  return new TextDecoder().decode(plaintextBuffer)
}
