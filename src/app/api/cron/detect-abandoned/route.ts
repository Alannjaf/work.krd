import { headers } from 'next/headers'
import { logAdminAction } from '@/lib/admin'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'
import { findAbandonedResumes, scheduleAbandonedResumeEmail } from '@/lib/email/schedulers'

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
 * Detect abandoned DRAFT resumes (24-48h idle) and schedule email reminders.
 */
async function detectAndScheduleAbandoned(): Promise<{
  detected: number
  scheduled: number
  failed: number
}> {
  const abandoned = await findAbandonedResumes()

  if (abandoned.length === 0) {
    return { detected: 0, scheduled: 0, failed: 0 }
  }

  let scheduled = 0
  let failed = 0

  for (const resume of abandoned) {
    try {
      await scheduleAbandonedResumeEmail(
        resume.userId,
        resume.resumeId,
        resume.resumeTitle
      )
      scheduled++
    } catch (err) {
      devError(`[Cron] Failed to schedule abandoned email for user ${resume.userId}:`, err)
      failed++
    }
  }

  // Log as system cron action
  await logAdminAction('system:cron', 'DETECT_ABANDONED_RESUMES', 'email_jobs', {
    detected: abandoned.length,
    scheduled,
    failed,
    userIds: abandoned.map((r) => r.userId),
  })

  return { detected: abandoned.length, scheduled, failed }
}

// GET — called by Netlify scheduled function (daily at 2 AM UTC)
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

    const result = await detectAndScheduleAbandoned()

    return successResponse({
      success: true,
      message: result.detected > 0
        ? `Detected ${result.detected} abandoned resumes, scheduled ${result.scheduled} emails`
        : 'No abandoned resumes detected',
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    devError('[Cron] detect-abandoned failed:', error)
    return errorResponse('Cron job failed', 500)
  }
}
