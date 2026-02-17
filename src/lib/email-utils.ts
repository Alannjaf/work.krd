import { createHmac } from 'crypto'

function getUnsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET env var is not set')
  return secret
}

/**
 * Generate an unsubscribe token for a user+campaign.
 * Format: base64(userId:campaign).hmac
 */
export function generateUnsubscribeToken(userId: string, campaign: string): string {
  const payload = Buffer.from(`${userId}:${campaign}`).toString('base64')
  const hmac = createHmac('sha256', getUnsubscribeSecret()).update(payload).digest('hex')
  return `${payload}.${hmac}`
}
