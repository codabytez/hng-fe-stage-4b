export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface ExportedKeyPair {
  publicKeyJwk: JsonWebKey
  wrappedPrivateKey: string
  pbkdf2Salt: string
}

export interface EncryptedPayload {
  ciphertext: string
  iv: string
  encryptedKey: string
  encryptedKeyForSelf: string
}

export interface StoredKeyMaterial {
  wrappedPrivateKey: string
  pbkdf2Salt: string
  publicKeyJwk: JsonWebKey
}
