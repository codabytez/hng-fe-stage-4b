import { create } from 'zustand'

interface PresenceState {
  onlineUserIds: Set<string>
  setOnline: (userId: string) => void
  setOffline: (userId: string) => void
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  onlineUserIds: new Set(),
  setOnline: (userId) =>
    set((s) => ({ onlineUserIds: new Set([...s.onlineUserIds, userId]) })),
  setOffline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUserIds)
      next.delete(userId)
      return { onlineUserIds: next }
    }),
}))
