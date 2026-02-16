/**
 * Shared admin utilities — date formatting, dev logging
 */

/**
 * Format a date for admin display.
 * - < 1 min: "Just now"
 * - < 60 min: "Xm ago"
 * - < 24h: "Xh ago"
 * - < 7d: "Xd ago"
 * - older: "YYYY-MM-DD"
 */
export function formatAdminDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toISOString().slice(0, 10)
}

/** Full ISO datetime for title/tooltip: "YYYY-MM-DD HH:MM" */
export function formatAdminDateFull(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

/** Console.error only in development — tree-shaken in production builds */
export function devError(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args)
  }
}
