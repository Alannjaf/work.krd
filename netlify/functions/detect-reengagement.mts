import type { Config } from '@netlify/functions'

// Netlify scheduled function — runs daily at 1:00 AM UTC
// Calls the Next.js cron API route to detect inactive users and schedule re-engagement emails
export default async function handler() {
  const baseUrl = process.env.URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Scheduled] CRON_SECRET not set — skipping re-engagement detection')
    return new Response('CRON_SECRET not configured', { status: 503 })
  }

  const response = await fetch(`${baseUrl}/api/cron/detect-reengagement`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cronSecret}`,
    },
  })

  const body = await response.text()
  console.log(`[Scheduled] detect-reengagement ${response.status}: ${body}`)

  return new Response(body, { status: response.status })
}

export const config: Config = {
  schedule: '0 1 * * *',
}
