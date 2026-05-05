const seen = new Set<string>()

export function isReplay(messageId: string, timestamp: string): boolean {
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
