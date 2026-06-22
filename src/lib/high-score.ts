export function createHighScoreStore(key: string) {
  function load(): number | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return null
      const parsed = Number(stored)
      return Number.isFinite(parsed) ? parsed : null
    } catch {
      return null
    }
  }

  function save(score: number): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, String(score))
    } catch {
      // localStorage unavailable — silently ignore
    }
  }

  return { load, save }
}
