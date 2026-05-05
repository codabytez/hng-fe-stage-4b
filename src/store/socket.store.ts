import { create } from 'zustand'

interface SocketStore {
  ws: WebSocket | null
  setWs: (ws: WebSocket | null) => void
}

export const useSocketStore = create<SocketStore>((set) => ({
  ws: null,
  setWs: (ws) => set({ ws }),
}))
