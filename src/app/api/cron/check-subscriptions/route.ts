import { headers } from 'next/headers'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'

// This endpoint can be called by external cron services like Vercel Cron, GitHub Actions, or any other scheduler
export async function GET() {
  try {
    // Require CRON_SECRET for cron job security
    const headersList = await headers()
    const cronSecret = headersList.get('authorization')

    if (!process.env.CRON_SECRET) {
      console.error('[Cron] CRON_SECRET env var is not set — endpoint disabled')
      return errorResponse('Cron endpoint not configured', 503)
    }
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return authErrorResponse()
    }

    // Cron job started: Checking for expired subscriptions
    
    // Call the check-expired endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/subscriptions/check-expired`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'}})

    if (!response.ok) {
      throw new Error(`Failed to check expired subscriptions: ${response.statusText}`)
    }

    const _result = await response.json()
    
    // Cron job completed
    
    return successResponse({
      success: true,
      timestamp: new Date().toISOString(),
      result: _result
    })

  } catch (error) {
    return errorResponse('Cron job failed', 500)
  }
}

// POST method for manual triggering (admin only)
export async function POST() {
  try {
    // Require CRON_SECRET or admin auth for manual trigger
    const headersList = await headers()
    const cronSecret = headersList.get('authorization')

    if (!process.env.CRON_SECRET) {
      console.error('[Cron] CRON_SECRET env var is not set — endpoint disabled')
      return errorResponse('Cron endpoint not configured', 503)
    }
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return authErrorResponse()
    }

    // Call the check-expired endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/subscriptions/check-expired`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'}})

    if (!response.ok) {
      throw new Error(`Failed to check expired subscriptions: ${response.statusText}`)
    }

    const _result = await response.json()

    return successResponse({
      success: true,
      message: 'Manual subscription check completed',
      timestamp: new Date().toISOString(),
      result: _result
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    return errorResponse('Manual subscription check failed', 500)
  }
}