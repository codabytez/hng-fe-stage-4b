import { create } from 'zustand'

interface CryptoState {
  privateKey: CryptoKey | null
  publicKey: CryptoKey | null
  isReady: boolean

  setKeyPair: (privateKey: CryptoKey, publicKey: CryptoKey) => void
  clearKeys: () => void
}

export const useCryptoStore = create<CryptoState>()((set) => ({
  privateKey: null,
  publicKey: null,
  isReady: false,

  setKeyPair: (privateKey, publicKey) =>
    set({ privateKey, publicKey, isReady: true }),

  clearKeys: () =>
    set({ privateKey: null, publicKey: null, isReady: false }),
}))
