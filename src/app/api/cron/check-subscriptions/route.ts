import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/admin'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'
import { PLAN_NAMES, PAID_PLANS } from '@/lib/constants'

/**
 * Verify the cron request has a valid CRON_SECRET bearer token.
 * Returns true if authorized, false otherwise.
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
 * Find and downgrade all expired paid subscriptions to FREE.
 * Shared logic for both GET (scheduled) and POST (manual) handlers.
 */
async function processExpiredSubscriptions(): Promise<{
  processed: number
  successful: number
  failed: number
  details: { successful: unknown[]; failed: unknown[] }
}> {
  const now = new Date()

  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      plan: { in: [...PAID_PLANS] },
      endDate: { lte: now },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  if (expiredSubscriptions.length === 0) {
    return { processed: 0, successful: 0, failed: 0, details: { successful: [], failed: [] } }
  }

  const downgradeResults = await Promise.allSettled(
    expiredSubscriptions.map(async (subscription) => {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: PLAN_NAMES.FREE,
          status: 'ACTIVE',
          endDate: null,
        },
      })
      return {
        success: true,
        userId: subscription.userId,
        previousPlan: subscription.plan,
        newPlan: PLAN_NAMES.FREE,
      }
    })
  )

  const successful = downgradeResults
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)

  const failed = downgradeResults
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => ({ error: r.reason instanceof Error ? r.reason.message : 'Unknown error' }))

  // Log as system cron action (not tied to an admin user)
  await logAdminAction('system:cron', 'PROCESS_EXPIRED_SUBSCRIPTIONS', 'subscriptions', {
    processed: expiredSubscriptions.length,
    successful: successful.length,
    failed: failed.length,
    downgradedUserIds: successful.map((s) => s.userId),
  })

  return {
    processed: expiredSubscriptions.length,
    successful: successful.length,
    failed: failed.length,
    details: { successful, failed },
  }
}

// GET — called by Netlify scheduled function (automated cron)
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

    const result = await processExpiredSubscriptions()

    return successResponse({
      success: true,
      message: result.processed > 0
        ? `Processed ${result.processed} expired subscriptions`
        : 'No expired subscriptions found',
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    devError('[Cron] check-subscriptions failed:', error)
    return errorResponse('Cron job failed', 500)
  }
}

// POST — manual trigger (also requires CRON_SECRET, used as admin fallback)
export async function POST() {
  try {
    if (!process.env.CRON_SECRET) {
      devError('[Cron] CRON_SECRET env var is not set — endpoint disabled')
      return errorResponse('Cron endpoint not configured', 503)
    }

    const authorized = await verifyCronAuth()
    if (!authorized) {
      return authErrorResponse()
    }

    const result = await processExpiredSubscriptions()

    return successResponse({
      success: true,
      message: result.processed > 0
        ? `Manual check: processed ${result.processed} expired subscriptions`
        : 'Manual check: no expired subscriptions found',
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    devError('[Cron] manual check-subscriptions failed:', error)
    return errorResponse('Manual subscription check failed', 500)
  }
}
