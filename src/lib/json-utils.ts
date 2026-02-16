/**
 * Parse a value that may be a JSON string array, actual array, or unknown into a string array.
 */
export function parseJsonArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string') {
    try { return JSON.parse(value) as string[] } catch { return fallback }
  }
  return fallback
}
