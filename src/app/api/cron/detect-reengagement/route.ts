import { headers } from 'next/headers'
import { logAdminAction } from '@/lib/admin'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'
import {
  findInactiveUsers,
  scheduleReengagementEmail,
  INACTIVITY_THRESHOLDS,
} from '@/lib/email/schedulers'

/**
 * Verify the cron request has a valid CRON_SECRET bearer token.
 */
async function verifyCronAuth(): Promise<boolean> {
  if (!process.env.CRON_SECRET) {
    devError('[Cron] CRON_SECRET env var is not set — endpoint disabled')
    return false
  }
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

/**
 * Detect inactive users across all thresholds (30/60/90 days)
 * and schedule re-engagement email jobs for each.
 */
async function detectAndScheduleReengagement(): Promise<{
  detected: number
  scheduled: number
  failed: number
  byThreshold: Record<number, number>
}> {
  let totalDetected = 0
  let totalScheduled = 0
  let totalFailed = 0
  const byThreshold: Record<number, number> = {}

  // Check each threshold — longest first so users get the most appropriate tier
  const thresholds = [...INACTIVITY_THRESHOLDS].reverse()

  for (const threshold of thresholds) {
    const users = await findInactiveUsers(threshold)
    byThreshold[threshold] = users.length
    totalDetected += users.length

    for (const user of users) {
      try {
        await scheduleReengagementEmail(
          user.userId,
          user.threshold,
          user.inactiveDays
        )
        totalScheduled++
      } catch (err) {
        devError(`[Cron] Failed to schedule re-engagement for user ${user.userId}:`, err)
        totalFailed++
      }
    }
  }

  // Log as system cron action
  await logAdminAction('system:cron', 'DETECT_REENGAGEMENT', 'email_jobs', {
    detected: totalDetected,
    scheduled: totalScheduled,
    failed: totalFailed,
    byThreshold,
  })

  return {
    detected: totalDetected,
    scheduled: totalScheduled,
    failed: totalFailed,
    byThreshold,
  }
}

// GET — called by Netlify scheduled function (daily at 1 AM UTC)
export async function GET() {
  try {
    if (!process.env.CRON_SECRET) {
      devError('[Cron] CRON_SECRET env var is not set — endpoint disabled')
      return errorResponse('Cron endpoint not configured', 503)
    }

    const authorized = await verifyCronAuth()
    if (!authorized) {
      return authErrorResponse()
    }

    const result = await detectAndScheduleReengagement()

    return successResponse({
      success: true,
      message: result.detected > 0
        ? `Detected ${result.detected} inactive users, scheduled ${result.scheduled} re-engagement emails`
        : 'No inactive users detected',
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    devError('[Cron] detect-reengagement failed:', error)
    return errorResponse('Cron job failed', 500)
  }
}
