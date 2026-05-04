const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const seen = new Set<string>()

export function isReplay(messageId: string, timestamp: string): boolean {
  const age = Date.now() - new Date(timestamp).getTime()
  if (age > WINDOW_MS) return true

  const key = `${messageId}:${timestamp}`
  if (seen.has(key)) return true

  seen.add(key)

  // prune old entries every 100 messages
  if (seen.size > 500) {
    const iter = seen.values()
    for (let i = 0; i < 100; i++) {
      const { value, done } = iter.next()
      if (done) break
      seen.delete(value)
    }
  }

  return false
}

export function clearReplayCache(): void {
  seen.clear()
}
