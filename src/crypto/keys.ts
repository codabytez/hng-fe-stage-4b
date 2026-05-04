import { bufferToBase64, base64ToBuffer, bufferToHex } from '@/utils/base64'

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  )
}

export async function exportPublicKeyAsSpki(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  return bufferToBase64(exported)
}

export async function importPublicKeyFromSpki(spkiB64: string): Promise<CryptoKey> {
  const keyData = base64ToBuffer(spkiB64)
  return crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt', 'wrapKey']
  )
}

export async function exportPublicKeyAsJwk(publicKey: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', publicKey)
}

export async function importPublicKeyFromJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt', 'wrapKey']
  )
}

export async function getKeyFingerprint(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  const hash = await crypto.subtle.digest('SHA-256', exported)
  const hex = bufferToHex(hash)
  // Format as groups of 4 for readability
  return hex.match(/.{1,4}/g)?.join(' ') ?? hex
}
